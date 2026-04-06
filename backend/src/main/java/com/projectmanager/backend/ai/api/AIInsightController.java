package com.projectmanager.backend.ai.api;

import com.projectmanager.backend.ai.application.AIInsightService;
import com.projectmanager.backend.ai.dto.AIInsightResponse;
import com.projectmanager.backend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AIInsightController {

    private final AIInsightService aiInsightService;

    @PostMapping("/api/projects/{id}/ai/summary")
    public ResponseEntity<ApiResponse<AIInsightResponse>> generateProjectSummary(
            @PathVariable("id") Long projectId
    ) {
        AIInsightResponse response = aiInsightService.generateProjectSummary(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트 요약을 생성했습니다.", response));
    }

    @PostMapping("/api/meeting-notes/{id}/ai/summary")
    public ResponseEntity<ApiResponse<AIInsightResponse>> generateMeetingSummary(
            @PathVariable("id") Long meetingNoteId
    ) {
        AIInsightResponse response = aiInsightService.generateMeetingSummary(meetingNoteId);
        return ResponseEntity.ok(ApiResponse.success("회의록 요약을 생성했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/ai/next-actions")
    public ResponseEntity<ApiResponse<AIInsightResponse>> generateNextActions(
            @PathVariable("id") Long projectId
    ) {
        AIInsightResponse response = aiInsightService.generateNextActions(projectId);
        return ResponseEntity.ok(ApiResponse.success("다음 액션 추천을 생성했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/ai/risk-analysis")
    public ResponseEntity<ApiResponse<AIInsightResponse>> generateRiskAnalysis(
            @PathVariable("id") Long projectId
    ) {
        AIInsightResponse response = aiInsightService.generateRiskAnalysis(projectId);
        return ResponseEntity.ok(ApiResponse.success("위험 분석을 생성했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/ai/weekly-report")
    public ResponseEntity<ApiResponse<AIInsightResponse>> generateWeeklyReport(
            @PathVariable("id") Long projectId
    ) {
        AIInsightResponse response = aiInsightService.generateWeeklyReport(projectId);
        return ResponseEntity.ok(ApiResponse.success("주간 보고서 초안을 생성했습니다.", response));
    }
}

