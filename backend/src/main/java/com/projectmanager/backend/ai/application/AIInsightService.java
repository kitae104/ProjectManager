package com.projectmanager.backend.ai.application;

import com.projectmanager.backend.ai.domain.AIInsight;
import com.projectmanager.backend.ai.domain.AIInsightRepository;
import com.projectmanager.backend.ai.domain.AIInsightType;
import com.projectmanager.backend.ai.domain.RiskLevel;
import com.projectmanager.backend.ai.dto.AIInsightResponse;
import com.projectmanager.backend.meetingnote.domain.MeetingNote;
import com.projectmanager.backend.meetingnote.domain.MeetingNoteRepository;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.task.domain.Task;
import com.projectmanager.backend.task.domain.TaskPriority;
import com.projectmanager.backend.task.domain.TaskRepository;
import com.projectmanager.backend.task.domain.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AIInsightService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final AIInsightRepository aiInsightRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MeetingNoteRepository meetingNoteRepository;

    @Transactional
    public AIInsightResponse generateProjectSummary(Long projectId) {
        Project project = findProject(projectId);
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        List<MeetingNote> meetingNotes = meetingNoteRepository.findByProjectIdOrderByMeetingDateTimeDesc(projectId);

        long totalTasks = tasks.size();
        long doneTasks = tasks.stream().filter(this::isDone).count();
        long inProgressTasks = tasks.stream().filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS).count();
        long blockedTasks = tasks.stream().filter(task -> task.getStatus() == TaskStatus.BLOCKED).count();

        List<String> blockedTaskTitles = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.BLOCKED)
                .map(Task::getTitle)
                .limit(3)
                .toList();

        List<Task> nextTasks = tasks.stream()
                .filter(task -> !isDone(task))
                .sorted(nextActionComparator())
                .limit(3)
                .toList();

        StringBuilder content = new StringBuilder();
        content.append("[프로젝트 개요]\n")
                .append("- 제목: ").append(project.getTitle()).append("\n")
                .append("- 상태: ").append(project.getStatus()).append("\n")
                .append("- 진행률: ").append(project.getProgress()).append("%\n\n")
                .append("[업무 현황]\n")
                .append("- 전체: ").append(totalTasks).append("건\n")
                .append("- 완료: ").append(doneTasks).append("건\n")
                .append("- 진행중: ").append(inProgressTasks).append("건\n")
                .append("- 블로킹: ").append(blockedTasks).append("건\n\n")
                .append("[핵심 이슈]\n");

        if (blockedTaskTitles.isEmpty()) {
            content.append("- 현재 블로킹 업무는 없습니다.\n");
        } else {
            blockedTaskTitles.forEach(title -> content.append("- 블로킹 업무: ").append(title).append("\n"));
        }

        content.append("\n[다음 핵심 작업]\n");
        if (nextTasks.isEmpty()) {
            content.append("- 진행할 업무가 없습니다. 신규 업무 계획 수립이 필요합니다.\n");
        } else {
            nextTasks.forEach(task -> content.append("- ").append(buildTaskLine(task)).append("\n"));
        }

        content.append("\n[최근 회의]\n");
        if (meetingNotes.isEmpty()) {
            content.append("- 최근 회의록이 없습니다.\n");
        } else {
            meetingNotes.stream()
                    .limit(2)
                    .forEach(note -> content
                            .append("- ")
                            .append(note.getMeetingDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                            .append(" / ")
                            .append(note.getTitle())
                            .append("\n"));
        }

        return saveInsight(project, AIInsightType.PROJECT_SUMMARY, content.toString(), null);
    }

    @Transactional
    public AIInsightResponse generateMeetingSummary(Long meetingNoteId) {
        MeetingNote note = meetingNoteRepository.findById(meetingNoteId)
                .orElseThrow(() -> new IllegalArgumentException("회의록을 찾을 수 없습니다."));

        String cleanContent = note.getContent().replaceAll("\\s+", " ").trim();
        String preview = cleanContent.length() <= 180 ? cleanContent : cleanContent.substring(0, 180) + "...";
        String summarySource = note.getSummary() == null || note.getSummary().isBlank()
                ? "요약 미작성"
                : note.getSummary();

        String content = """
                [회의 요약]
                - 회의 제목: %s
                - 회의 일시: %s
                - 참석자: %s

                [핵심 논의]
                - %s

                [결정/액션]
                - %s
                """.formatted(
                note.getTitle(),
                note.getMeetingDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                note.getAttendees(),
                preview,
                summarySource
        ).trim();

        return saveInsight(note.getProject(), AIInsightType.MEETING_SUMMARY, content, null);
    }

    @Transactional
    public AIInsightResponse generateNextActions(Long projectId) {
        Project project = findProject(projectId);
        LocalDate today = LocalDate.now();

        List<Task> candidates = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .filter(task -> !isDone(task))
                .sorted(nextActionComparator())
                .limit(5)
                .toList();

        StringBuilder content = new StringBuilder("[다음 액션 추천]\n");
        if (candidates.isEmpty()) {
            content.append("- 미완료 업무가 없습니다. 다음 스프린트 계획 수립을 권장합니다.");
        } else {
            for (int index = 0; index < candidates.size(); index++) {
                Task task = candidates.get(index);
                content.append(index + 1)
                        .append(". ")
                        .append(task.getTitle())
                        .append(" (상태: ").append(task.getStatus())
                        .append(", 우선순위: ").append(task.getPriority()).append(")")
                        .append("\n   - 이유: ").append(buildActionReason(task, today))
                        .append("\n");
            }
        }

        return saveInsight(project, AIInsightType.NEXT_ACTIONS, content.toString().trim(), null);
    }

    @Transactional
    public AIInsightResponse generateRiskAnalysis(Long projectId) {
        Project project = findProject(projectId);
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        LocalDate today = LocalDate.now();

        long totalTasks = tasks.size();
        long doneTasks = tasks.stream().filter(this::isDone).count();
        long blockedTasks = tasks.stream().filter(task -> task.getStatus() == TaskStatus.BLOCKED).count();
        long overdueTasks = tasks.stream().filter(task -> isOverdue(task, today)).count();

        int riskScore = 0;
        if (blockedTasks > 0) {
            riskScore += 2;
        }
        if (overdueTasks > 0) {
            riskScore += 2;
        }
        if (totalTasks > 0 && doneTasks * 100 / totalTasks < 40) {
            riskScore += 1;
        }
        if (project.getProgress() < 50 && overdueTasks > 0) {
            riskScore += 1;
        }

        RiskLevel riskLevel = riskScore <= 1 ? RiskLevel.LOW : (riskScore <= 3 ? RiskLevel.MEDIUM : RiskLevel.HIGH);

        List<String> causes = new ArrayList<>();
        if (blockedTasks > 0) {
            causes.add("블로킹 상태 업무가 " + blockedTasks + "건 존재합니다.");
        }
        if (overdueTasks > 0) {
            causes.add("마감일이 지난 미완료 업무가 " + overdueTasks + "건 존재합니다.");
        }
        if (totalTasks > 0 && doneTasks * 100 / totalTasks < 40) {
            causes.add("완료율이 40% 미만입니다.");
        }
        if (causes.isEmpty()) {
            causes.add("현재 기준으로 뚜렷한 지연 징후는 크지 않습니다.");
        }

        List<String> actions = new ArrayList<>();
        actions.add("블로킹 업무를 우선 해소하고 담당자/기한을 재확정합니다.");
        actions.add("마감 임박 업무를 일 단위로 재배치해 단기 완료율을 높입니다.");
        actions.add("주간 회의에서 리스크 항목을 고정 안건으로 점검합니다.");

        StringBuilder content = new StringBuilder();
        content.append("[지연 위험 분석]\n")
                .append("- 위험도: ").append(riskLevel).append("\n")
                .append("- 진행률: ").append(project.getProgress()).append("%\n")
                .append("- 완료/전체 업무: ").append(doneTasks).append("/").append(totalTasks).append("\n\n")
                .append("[위험 원인]\n");
        causes.forEach(cause -> content.append("- ").append(cause).append("\n"));
        content.append("\n[권장 대응]\n");
        actions.forEach(action -> content.append("- ").append(action).append("\n"));

        return saveInsight(project, AIInsightType.RISK_ANALYSIS, content.toString().trim(), riskLevel);
    }

    @Transactional
    public AIInsightResponse generateWeeklyReport(Long projectId) {
        Project project = findProject(projectId);
        List<Task> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        List<MeetingNote> meetingNotes = meetingNoteRepository.findByProjectIdOrderByMeetingDateTimeDesc(projectId);

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        Instant weekStartInstant = weekStart.atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<Task> completedThisWeek = tasks.stream()
                .filter(this::isDone)
                .filter(task -> task.getUpdatedAt().isAfter(weekStartInstant))
                .limit(5)
                .toList();
        List<Task> inProgress = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS || task.getStatus() == TaskStatus.IN_REVIEW)
                .limit(5)
                .toList();
        List<Task> issues = tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.BLOCKED || isOverdue(task, today))
                .limit(5)
                .toList();
        List<Task> nextWeekPlans = tasks.stream()
                .filter(task -> !isDone(task))
                .sorted(nextActionComparator())
                .limit(5)
                .toList();
        List<MeetingNote> recentMeetings = meetingNotes.stream()
                .filter(note -> !note.getMeetingDateTime().toLocalDate().isBefore(weekStart))
                .limit(3)
                .toList();

        StringBuilder content = new StringBuilder();
        content.append("[주간 보고서 초안]\n")
                .append("- 프로젝트: ").append(project.getTitle()).append("\n")
                .append("- 기준 주차 시작일: ").append(weekStart.format(DATE_FORMATTER)).append("\n\n")
                .append("1) 이번 주 완료 업무\n");
        appendTaskSection(content, completedThisWeek, "완료된 업무가 없습니다.");

        content.append("\n2) 진행 중 업무\n");
        appendTaskSection(content, inProgress, "진행 중 업무가 없습니다.");

        content.append("\n3) 이슈 및 리스크\n");
        appendTaskSection(content, issues, "현재 등록된 주요 이슈가 없습니다.");

        content.append("\n4) 다음 주 계획\n");
        appendTaskSection(content, nextWeekPlans, "다음 주 계획 대상 업무가 없습니다.");

        content.append("\n5) 회의 요약\n");
        if (recentMeetings.isEmpty()) {
            content.append("- 이번 주 회의록이 없습니다.\n");
        } else {
            recentMeetings.forEach(note -> content.append("- ")
                    .append(note.getMeetingDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .append(" / ")
                    .append(note.getTitle())
                    .append("\n"));
        }

        return saveInsight(project, AIInsightType.WEEKLY_REPORT, content.toString().trim(), null);
    }

    private void appendTaskSection(StringBuilder builder, List<Task> tasks, String emptyMessage) {
        if (tasks.isEmpty()) {
            builder.append("- ").append(emptyMessage).append("\n");
            return;
        }
        tasks.forEach(task -> builder.append("- ").append(buildTaskLine(task)).append("\n"));
    }

    private String buildTaskLine(Task task) {
        String due = task.getDueDate() == null ? "미정" : task.getDueDate().format(DATE_FORMATTER);
        return task.getTitle() + " [상태: " + task.getStatus() + ", 우선순위: " + task.getPriority() + ", 마감: " + due + "]";
    }

    private String buildActionReason(Task task, LocalDate today) {
        if (isOverdue(task, today)) {
            return "마감일이 이미 경과했습니다.";
        }
        if (task.getPriority() == TaskPriority.URGENT || task.getPriority() == TaskPriority.HIGH) {
            return "우선순위가 높아 즉시 대응이 필요합니다.";
        }
        if (task.getDueDate() != null && !task.getDueDate().isAfter(today.plusDays(3))) {
            return "3일 이내 마감 예정 업무입니다.";
        }
        if (task.getStatus() == TaskStatus.BLOCKED) {
            return "진행이 중단된 상태로 병목 해소가 필요합니다.";
        }
        return "프로젝트 진행률 개선을 위한 선행 작업입니다.";
    }

    private Comparator<Task> nextActionComparator() {
        return Comparator
                .comparingInt((Task task) -> priorityScore(task.getPriority())).reversed()
                .thenComparing(task -> task.getDueDate() == null ? LocalDate.MAX : task.getDueDate())
                .thenComparing(Task::getCreatedAt);
    }

    private int priorityScore(TaskPriority priority) {
        return switch (priority) {
            case URGENT -> 4;
            case HIGH -> 3;
            case MEDIUM -> 2;
            case LOW -> 1;
        };
    }

    private boolean isDone(Task task) {
        return task.getStatus() == TaskStatus.DONE;
    }

    private boolean isOverdue(Task task, LocalDate today) {
        return task.getDueDate() != null && task.getDueDate().isBefore(today) && !isDone(task);
    }

    private AIInsightResponse saveInsight(
            Project project,
            AIInsightType type,
            String content,
            RiskLevel riskLevel
    ) {
        AIInsight insight = AIInsight.create(project, type, content, riskLevel);
        AIInsight saved = aiInsightRepository.save(insight);
        return AIInsightResponse.from(saved);
    }

    private Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
    }
}

