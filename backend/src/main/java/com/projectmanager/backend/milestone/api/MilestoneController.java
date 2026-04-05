package com.projectmanager.backend.milestone.api;

import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.milestone.application.MilestoneService;
import com.projectmanager.backend.milestone.dto.MilestoneCreateRequest;
import com.projectmanager.backend.milestone.dto.MilestoneResponse;
import com.projectmanager.backend.milestone.dto.MilestoneUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/api/projects/{id}/milestones")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getProjectMilestones(
            @PathVariable("id") Long projectId
    ) {
        List<MilestoneResponse> response = milestoneService.getProjectMilestones(projectId);
        return ResponseEntity.ok(ApiResponse.success("마일스톤 목록을 조회했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/milestones")
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestone(
            @PathVariable("id") Long projectId,
            @Valid @RequestBody MilestoneCreateRequest request
    ) {
        MilestoneResponse response = milestoneService.createMilestone(projectId, request);
        return ResponseEntity.ok(ApiResponse.success("마일스톤을 생성했습니다.", response));
    }

    @PutMapping("/api/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(
            @PathVariable("milestoneId") Long milestoneId,
            @Valid @RequestBody MilestoneUpdateRequest request
    ) {
        MilestoneResponse response = milestoneService.updateMilestone(milestoneId, request);
        return ResponseEntity.ok(ApiResponse.success("마일스톤을 수정했습니다.", response));
    }

    @DeleteMapping("/api/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(
            @PathVariable("milestoneId") Long milestoneId
    ) {
        milestoneService.deleteMilestone(milestoneId);
        return ResponseEntity.ok(ApiResponse.success("마일스톤을 삭제했습니다."));
    }
}

