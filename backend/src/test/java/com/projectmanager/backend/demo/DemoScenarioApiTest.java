package com.projectmanager.backend.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.projectmanager.backend.ai.domain.AIInsightRepository;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DemoScenarioApiTest {

    private static final String COMMON_PASSWORD = "11112222";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIInsightRepository aiInsightRepository;

    @Test
    void shouldCreateDemoScenarioAndExportSummary() throws Exception {
        signup("user1", "user1@example.com", COMMON_PASSWORD, "CS");
        signup("user2", "user2@example.com", COMMON_PASSWORD, "SW");
        signup("user3", "user3@example.com", COMMON_PASSWORD, "AI");

        updateRole("user1@example.com", UserRole.ADMIN);
        updateRole("user2@example.com", UserRole.LEADER);
        updateRole("user3@example.com", UserRole.MEMBER);

        String adminToken = login("user1@example.com", COMMON_PASSWORD);
        String leaderToken = login("user2@example.com", COMMON_PASSWORD);
        String memberToken = login("user3@example.com", COMMON_PASSWORD);

        long adminId = getMyUserId(adminToken);
        long leaderId = getMyUserId(leaderToken);
        long memberId = getMyUserId(memberToken);

        long adminProjectId = createProject(
                adminToken,
                "2026-1 캡스톤 공통 운영",
                "학기 운영 공지/체크리스트 관리",
                "CAPSTONE",
                "PLANNING",
                adminId,
                5
        );
        long leaderProjectId = createProject(
                leaderToken,
                "AI 회의록 자동화 플랫폼",
                "팀 MVP 및 자동 요약 기능 개발",
                "AI",
                "IN_PROGRESS",
                leaderId,
                32
        );
        long memberProjectId = createProject(
                memberToken,
                "추천 모델 성능 개선 실험",
                "A/B 테스트 기반 모델 개선 실험",
                "DEVELOPMENT",
                "PLANNING",
                memberId,
                12
        );

        addMember(adminToken, leaderProjectId, adminId, "PM", "운영 의사결정 지원");
        addMember(adminToken, leaderProjectId, memberId, "BACKEND", "모델 API 및 배치 처리");
        addMember(adminToken, adminProjectId, leaderId, "LEADER", "분반 프로젝트 리딩");
        addMember(adminToken, memberProjectId, leaderId, "AI", "실험 설계 검토");

        long task1 = createTask(
                leaderToken,
                leaderProjectId,
                "백엔드 API 설계",
                "인증/프로젝트/태스크 API 스펙 정리",
                "IN_PROGRESS",
                "HIGH",
                memberId,
                leaderId,
                45
        );
        long task2 = createTask(
                leaderToken,
                leaderProjectId,
                "프론트 대시보드 구현",
                "핵심 KPI 카드와 상태 분포 차트 구성",
                "TODO",
                "MEDIUM",
                leaderId,
                leaderId,
                0
        );
        createTask(
                leaderToken,
                leaderProjectId,
                "통합 테스트 시나리오 정리",
                "핵심 API 회귀 테스트 케이스 작성",
                "BLOCKED",
                "URGENT",
                adminId,
                leaderId,
                20
        );

        updateTaskStatus(leaderToken, task2, "DONE");
        updateTaskStatus(leaderToken, task1, "IN_REVIEW");

        createMilestone(
                leaderToken,
                leaderProjectId,
                "M1 설계 완료",
                "요구사항/아키텍처/데이터 모델 확정",
                LocalDate.now().plusDays(14),
                "IN_PROGRESS"
        );
        createMilestone(
                leaderToken,
                leaderProjectId,
                "M2 MVP 완료",
                "핵심 기능 MVP 배포",
                LocalDate.now().plusDays(35),
                "PLANNED"
        );

        createSchedule(
                leaderToken,
                leaderProjectId,
                "주간 스프린트 회의",
                "백로그 점검 및 우선순위 조정",
                "MEETING",
                LocalDateTime.now().plusDays(2).withHour(10).withMinute(0),
                LocalDateTime.now().plusDays(2).withHour(11).withMinute(0),
                "온라인"
        );
        createSchedule(
                leaderToken,
                leaderProjectId,
                "중간 발표 리허설",
                "발표 자료/데모 리허설",
                "PRESENTATION",
                LocalDateTime.now().plusDays(9).withHour(15).withMinute(0),
                LocalDateTime.now().plusDays(9).withHour(16).withMinute(30),
                "강의실 A"
        );

        createDocument(
                leaderToken,
                leaderProjectId,
                "시스템 아키텍처 초안",
                "TECHNICAL_DOC",
                "Gateway, API, Worker, DB 구조와 책임 분리",
                "v1"
        );

        long meetingNoteId = createMeetingNote(
                leaderToken,
                leaderProjectId,
                "스프린트 킥오프",
                "user1, user2, user3",
                "스프린트 목표, 리스크, 담당 범위를 정리함",
                "API 우선 구현 후 UI 연동"
        );

        generateProjectAiInsight(leaderToken, leaderProjectId, "summary");
        generateProjectAiInsight(leaderToken, leaderProjectId, "next-actions");
        generateProjectAiInsight(leaderToken, leaderProjectId, "risk-analysis");
        generateProjectAiInsight(leaderToken, leaderProjectId, "weekly-report");
        generateMeetingAiInsight(leaderToken, meetingNoteId);

        List<JsonNode> projects = getDataList(getWithAuth(adminToken, "/api/projects"));
        List<JsonNode> members = getDataList(getWithAuth(adminToken, "/api/projects/" + leaderProjectId + "/members"));
        List<JsonNode> tasks = getDataList(getWithAuth(adminToken, "/api/projects/" + leaderProjectId + "/tasks"));
        List<JsonNode> milestones = getDataList(getWithAuth(adminToken, "/api/projects/" + leaderProjectId + "/milestones"));
        List<JsonNode> schedules = getDataList(getWithAuth(adminToken, "/api/projects/" + leaderProjectId + "/schedules"));
        List<JsonNode> documents = getDataList(getWithAuth(adminToken, "/api/projects/" + leaderProjectId + "/documents"));
        List<JsonNode> meetingNotes = getDataList(getWithAuth(adminToken, "/api/projects/" + leaderProjectId + "/meeting-notes"));
        int aiInsightsCount = aiInsightRepository.findByProjectIdOrderByCreatedAtDesc(leaderProjectId).size();

        Map<String, Integer> taskStatusSummary = new LinkedHashMap<>();
        taskStatusSummary.put("TODO", 0);
        taskStatusSummary.put("IN_PROGRESS", 0);
        taskStatusSummary.put("IN_REVIEW", 0);
        taskStatusSummary.put("DONE", 0);
        taskStatusSummary.put("BLOCKED", 0);
        for (JsonNode task : tasks) {
            String status = task.path("status").asText();
            taskStatusSummary.computeIfPresent(status, (key, value) -> value + 1);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("demoTitle", "Role 기반 샘플 프로젝트 수행 결과");
        summary.put("users", List.of(
                Map.of("name", "user1", "email", "user1@example.com", "role", "ADMIN"),
                Map.of("name", "user2", "email", "user2@example.com", "role", "LEADER"),
                Map.of("name", "user3", "email", "user3@example.com", "role", "MEMBER")
        ));
        summary.put("projectsCreated", projects.size());
        summary.put("projectIds", Map.of(
                "adminProjectId", adminProjectId,
                "leaderProjectId", leaderProjectId,
                "memberProjectId", memberProjectId
        ));
        summary.put("leaderProjectSnapshot", Map.of(
                "members", members.size(),
                "tasks", tasks.size(),
                "taskStatusSummary", taskStatusSummary,
                "milestones", milestones.size(),
                "schedules", schedules.size(),
                "documents", documents.size(),
                "meetingNotes", meetingNotes.size(),
                "aiInsights", aiInsightsCount
        ));

        Path reportDir = Path.of("build", "reports", "demo");
        Files.createDirectories(reportDir);
        Path reportPath = reportDir.resolve("demo-scenario-summary.json");
        String reportJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(summary);
        Files.writeString(reportPath, reportJson);

        System.out.println("[DEMO] Summary file: " + reportPath.toAbsolutePath());
        System.out.println(reportJson);

        assertEquals(3, projects.size());
        assertTrue(tasks.size() >= 3);
        assertEquals(1, taskStatusSummary.get("DONE"));
        assertEquals(1, taskStatusSummary.get("IN_REVIEW"));
    }

    private void signup(String name, String email, String password, String department) throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("name", name);
        request.put("email", email);
        request.put("password", password);
        request.put("department", department);

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private String login(String email, String password) throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("email", email);
        request.put("password", password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andReturn();

        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        return payload.path("data").path("accessToken").asText();
    }

    private long getMyUserId(String accessToken) throws Exception {
        JsonNode payload = getWithAuth(accessToken, "/api/auth/me");
        return payload.path("data").path("id").asLong();
    }

    private long createProject(
            String accessToken,
            String title,
            String description,
            String category,
            String status,
            long leaderId,
            int progress
    ) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("title", title);
        request.put("description", description);
        request.put("category", category);
        request.put("status", status);
        request.put("semester", "2026-1");
        request.put("startDate", LocalDate.now().toString());
        request.put("endDate", LocalDate.now().plusDays(60).toString());
        request.put("progress", progress);
        request.put("leaderId", leaderId);

        MvcResult result = mockMvc.perform(post("/api/projects")
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andReturn();

        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        return payload.path("data").path("id").asLong();
    }

    private void addMember(
            String accessToken,
            long projectId,
            long userId,
            String projectRole,
            String responsibility
    ) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("userId", userId);
        request.put("projectRole", projectRole);
        request.put("responsibility", responsibility);

        mockMvc.perform(post("/api/projects/{id}/members", projectId)
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private long createTask(
            String accessToken,
            long projectId,
            String title,
            String description,
            String status,
            String priority,
            long assigneeId,
            long reporterId,
            int progress
    ) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("title", title);
        request.put("description", description);
        request.put("status", status);
        request.put("priority", priority);
        request.put("assigneeId", assigneeId);
        request.put("reporterId", reporterId);
        request.put("startDate", LocalDate.now().toString());
        request.put("dueDate", LocalDate.now().plusDays(7).toString());
        request.put("progress", progress);

        MvcResult result = mockMvc.perform(post("/api/projects/{id}/tasks", projectId)
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andReturn();

        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        return payload.path("data").path("id").asLong();
    }

    private void updateTaskStatus(String accessToken, long taskId, String status) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("status", status);

        mockMvc.perform(patch("/api/tasks/{taskId}/status", taskId)
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private void createMilestone(
            String accessToken,
            long projectId,
            String title,
            String description,
            LocalDate dueDate,
            String status
    ) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("title", title);
        request.put("description", description);
        request.put("dueDate", dueDate.toString());
        request.put("status", status);

        mockMvc.perform(post("/api/projects/{id}/milestones", projectId)
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private void createSchedule(
            String accessToken,
            long projectId,
            String title,
            String description,
            String scheduleType,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            String location
    ) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("title", title);
        request.put("description", description);
        request.put("scheduleType", scheduleType);
        request.put("startDateTime", startDateTime.toString());
        request.put("endDateTime", endDateTime.toString());
        request.put("location", location);

        mockMvc.perform(post("/api/projects/{id}/schedules", projectId)
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private void createDocument(
            String accessToken,
            long projectId,
            String title,
            String type,
            String content,
            String version
    ) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("title", title);
        request.put("type", type);
        request.put("content", content);
        request.put("version", version);

        mockMvc.perform(post("/api/projects/{id}/documents", projectId)
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private long createMeetingNote(
            String accessToken,
            long projectId,
            String title,
            String attendees,
            String content,
            String summary
    ) throws Exception {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("title", title);
        request.put("meetingDateTime", LocalDateTime.now().toString());
        request.put("attendees", attendees);
        request.put("content", content);
        request.put("summary", summary);

        MvcResult result = mockMvc.perform(post("/api/projects/{id}/meeting-notes", projectId)
                        .contentType(APPLICATION_JSON)
                        .header("Authorization", bearer(accessToken))
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andReturn();

        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        return payload.path("data").path("id").asLong();
    }

    private void generateProjectAiInsight(String accessToken, long projectId, String type) throws Exception {
        mockMvc.perform(post("/api/projects/{id}/ai/{type}", projectId, type)
                        .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private void generateMeetingAiInsight(String accessToken, long meetingNoteId) throws Exception {
        mockMvc.perform(post("/api/meeting-notes/{id}/ai/summary", meetingNoteId)
                        .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private JsonNode getWithAuth(String accessToken, String path) throws Exception {
        MvcResult result = mockMvc.perform(get(path)
                        .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private List<JsonNode> getDataList(JsonNode payload) {
        List<JsonNode> result = new ArrayList<>();
        JsonNode data = payload.path("data");
        if (data.isArray()) {
            data.forEach(result::add);
        }
        return result;
    }

    private void updateRole(String email, UserRole role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
        user.updateRole(role);
        userRepository.save(user);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
