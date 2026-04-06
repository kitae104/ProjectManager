package com.projectmanager.backend.ai.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.projectmanager.backend.ai.domain.AIInsightType;
import com.projectmanager.backend.ai.domain.RiskLevel;
import com.projectmanager.backend.ai.dto.AIInsightResponse;
import com.projectmanager.backend.meetingnote.domain.MeetingNote;
import com.projectmanager.backend.meetingnote.domain.MeetingNoteRepository;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.task.domain.Task;
import com.projectmanager.backend.task.domain.TaskPriority;
import com.projectmanager.backend.task.domain.TaskRepository;
import com.projectmanager.backend.task.domain.TaskStatus;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class AIInsightServiceTest {

    @Autowired
    private AIInsightService aiInsightService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private MeetingNoteRepository meetingNoteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldGenerateProjectSummaryAndRiskAnalysis() {
        String suffix = String.valueOf(System.nanoTime());
        User user = userRepository.save(
                User.create(
                        "AI User",
                        "ai-user-" + suffix + "@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );

        Project project = projectRepository.save(
                Project.create(
                        "AI Test Project",
                        "AI 기능 테스트 프로젝트",
                        ProjectCategory.AI,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        LocalDate.now().minusWeeks(2),
                        LocalDate.now().plusWeeks(4),
                        35,
                        user
                )
        );

        taskRepository.save(Task.create(
                project,
                "모델 성능 검증",
                "실험 결과 비교",
                TaskStatus.BLOCKED,
                TaskPriority.HIGH,
                user,
                user,
                LocalDate.now().minusDays(4),
                LocalDate.now().minusDays(1),
                40
        ));
        taskRepository.save(Task.create(
                project,
                "프롬프트 개선",
                "질의별 템플릿 개선",
                TaskStatus.IN_PROGRESS,
                TaskPriority.URGENT,
                user,
                user,
                LocalDate.now().minusDays(2),
                LocalDate.now().plusDays(2),
                50
        ));
        taskRepository.save(Task.create(
                project,
                "리포트 자동화",
                "주간 보고서 포맷 적용",
                TaskStatus.DONE,
                TaskPriority.MEDIUM,
                user,
                user,
                LocalDate.now().minusDays(10),
                LocalDate.now().minusDays(3),
                100
        ));

        MeetingNote note = meetingNoteRepository.save(MeetingNote.create(
                project,
                "AI 주간 회의",
                LocalDateTime.now().minusDays(1),
                "AI User, Member A",
                "핵심 이슈와 다음 액션을 점검함",
                "블로킹 업무 해소가 필요",
                user
        ));

        AIInsightResponse projectSummary = aiInsightService.generateProjectSummary(project.getId());
        assertNotNull(projectSummary.id());
        assertEquals(AIInsightType.PROJECT_SUMMARY, projectSummary.insightType());
        assertTrue(projectSummary.content().contains("프로젝트 개요"));

        AIInsightResponse riskAnalysis = aiInsightService.generateRiskAnalysis(project.getId());
        assertNotNull(riskAnalysis.id());
        assertEquals(AIInsightType.RISK_ANALYSIS, riskAnalysis.insightType());
        assertTrue(riskAnalysis.riskLevel() == RiskLevel.MEDIUM || riskAnalysis.riskLevel() == RiskLevel.HIGH);

        AIInsightResponse meetingSummary = aiInsightService.generateMeetingSummary(note.getId());
        assertEquals(AIInsightType.MEETING_SUMMARY, meetingSummary.insightType());
        assertTrue(meetingSummary.content().contains("회의 요약"));
    }
}

