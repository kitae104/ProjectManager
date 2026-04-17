package com.projectmanager.backend.milestone.api;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.milestone.application.MilestoneService;
import com.projectmanager.backend.milestone.dto.MilestoneCreateRequest;
import com.projectmanager.backend.milestone.dto.MilestoneResponse;
import com.projectmanager.backend.milestone.dto.MilestoneUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            @PathVariable("id") Long projectId,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        List<MilestoneResponse> response = milestoneService.getProjectMilestones(projectId, user);
        return ResponseEntity.ok(ApiResponse.success("마일스톤 목록을 조회했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/milestones")
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestone(
            @PathVariable("id") Long projectId,
            @Valid @RequestBody MilestoneCreateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        MilestoneResponse response = milestoneService.createMilestone(projectId, request, user);
        return ResponseEntity.ok(ApiResponse.success("마일스톤을 생성했습니다.", response));
    }

    @PutMapping("/api/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(
            @PathVariable("milestoneId") Long milestoneId,
            @Valid @RequestBody MilestoneUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        MilestoneResponse response = milestoneService.updateMilestone(milestoneId, request, user);
        return ResponseEntity.ok(ApiResponse.success("마일스톤을 수정했습니다.", response));
    }

    @DeleteMapping("/api/milestones/{milestoneId}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(
            @PathVariable("milestoneId") Long milestoneId,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        milestoneService.deleteMilestone(milestoneId, user);
        return ResponseEntity.ok(ApiResponse.success("마일스톤을 삭제했습니다."));
    }
}
