package com.projectmanager.backend.schedule.application;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.schedule.domain.Schedule;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.client.ChatClient;

@Service
public class ScheduleEmailContentService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private final ChatClient chatClient;

    public ScheduleEmailContentService(ObjectProvider<ChatClient.Builder> chatClientBuilderProvider) {
        ChatClient.Builder builder = chatClientBuilderProvider.getIfAvailable();
        this.chatClient = builder != null ? builder.build() : null;
    }

    public String generateScheduleCreatedHtml(Project project, Schedule schedule) {
        String fallbackHtml = buildFallbackHtml(project, schedule);
        if (chatClient == null) {
            return fallbackHtml;
        }

        try {
            String prompt = """
                    아래 프로젝트 일정 공유 메일을 한국어 비즈니스 톤의 HTML 본문으로 작성해 주세요.
                    - 반드시 HTML만 출력 (``` 코드블록 금지)
                    - 스타일은 인라인 CSS로 최소한 적용
                    - 과도한 장식 없이 가독성 중심
                    - 반드시 아래 항목 포함: 프로젝트명, 일정명, 일정유형, 시작일시, 종료일시, 장소, 상세내용

                    프로젝트명: %s
                    일정명: %s
                    일정유형: %s
                    시작일시: %s
                    종료일시: %s
                    장소: %s
                    상세내용: %s
                    """.formatted(
                    project.getTitle(),
                    schedule.getTitle(),
                    toScheduleTypeLabel(schedule),
                    schedule.getStartDateTime().format(DATE_TIME_FORMATTER),
                    schedule.getEndDateTime().format(DATE_TIME_FORMATTER),
                    schedule.getLocation() == null || schedule.getLocation().isBlank() ? "미정" : schedule.getLocation(),
                    schedule.getDescription()
            );

            String generated = chatClient.prompt()
                    .system("너는 프로젝트 관리 시스템의 일정 공유 메일 작성 도우미다.")
                    .user(prompt)
                    .call()
                    .content();

            if (generated == null || generated.isBlank()) {
                return fallbackHtml;
            }

            return normalizeGeneratedHtml(generated, fallbackHtml);
        } catch (Exception ignored) {
            return fallbackHtml;
        }
    }

    private String normalizeGeneratedHtml(String generated, String fallbackHtml) {
        String normalized = generated.trim();

        if (normalized.startsWith("```")) {
            normalized = normalized
                    .replaceFirst("^```[a-zA-Z]*\\s*", "")
                    .replaceFirst("\\s*```$", "")
                    .trim();
        }

        String lower = normalized.toLowerCase();
        if (!lower.contains("<html") && !lower.contains("<body") && !lower.contains("<div")) {
            return fallbackHtml;
        }

        return normalized;
    }

    private String buildFallbackHtml(Project project, Schedule schedule) {
        String location = schedule.getLocation() == null || schedule.getLocation().isBlank()
                ? "미정"
                : escapeHtml(schedule.getLocation());

        return """
                <html>
                  <body style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.5;">
                    <h2 style="margin: 0 0 12px 0;">프로젝트 일정 공유</h2>
                    <p style="margin: 0 0 16px 0;">아래 일정이 새로 등록되었습니다.</p>
                    <table style="border-collapse: collapse; width: 100%%; max-width: 680px;">
                      <tr><th style="text-align:left; padding:8px; border:1px solid #cbd5e1; background:#f8fafc;">프로젝트</th><td style="padding:8px; border:1px solid #cbd5e1;">%s</td></tr>
                      <tr><th style="text-align:left; padding:8px; border:1px solid #cbd5e1; background:#f8fafc;">일정명</th><td style="padding:8px; border:1px solid #cbd5e1;">%s</td></tr>
                      <tr><th style="text-align:left; padding:8px; border:1px solid #cbd5e1; background:#f8fafc;">일정유형</th><td style="padding:8px; border:1px solid #cbd5e1;">%s</td></tr>
                      <tr><th style="text-align:left; padding:8px; border:1px solid #cbd5e1; background:#f8fafc;">시작일시</th><td style="padding:8px; border:1px solid #cbd5e1;">%s</td></tr>
                      <tr><th style="text-align:left; padding:8px; border:1px solid #cbd5e1; background:#f8fafc;">종료일시</th><td style="padding:8px; border:1px solid #cbd5e1;">%s</td></tr>
                      <tr><th style="text-align:left; padding:8px; border:1px solid #cbd5e1; background:#f8fafc;">장소</th><td style="padding:8px; border:1px solid #cbd5e1;">%s</td></tr>
                      <tr><th style="text-align:left; padding:8px; border:1px solid #cbd5e1; background:#f8fafc;">상세내용</th><td style="padding:8px; border:1px solid #cbd5e1;">%s</td></tr>
                    </table>
                    <p style="margin: 16px 0 0 0;">확인 부탁드립니다.</p>
                  </body>
                </html>
                """.formatted(
                escapeHtml(project.getTitle()),
                escapeHtml(schedule.getTitle()),
                escapeHtml(toScheduleTypeLabel(schedule)),
                escapeHtml(schedule.getStartDateTime().format(DATE_TIME_FORMATTER)),
                escapeHtml(schedule.getEndDateTime().format(DATE_TIME_FORMATTER)),
                location,
                escapeHtml(schedule.getDescription())
        );
    }

    private String toScheduleTypeLabel(Schedule schedule) {
        return switch (schedule.getScheduleType()) {
            case MEETING -> "회의";
            case PRESENTATION -> "발표";
            case SUBMISSION -> "제출";
            case DEMO -> "데모";
            case MENTORING -> "멘토링";
            case INTERNAL_REVIEW -> "내부 검토";
        };
    }

    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
