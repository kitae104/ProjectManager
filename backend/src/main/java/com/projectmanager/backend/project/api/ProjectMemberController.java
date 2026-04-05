package com.projectmanager.backend.project.api;

import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.project.application.ProjectService;
import com.projectmanager.backend.project.dto.ProjectMemberCreateRequest;
import com.projectmanager.backend.project.dto.ProjectMemberResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{id}/members")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getMembers(
            @PathVariable("id") Long projectId
    ) {
        List<ProjectMemberResponse> response = projectService.getProjectMembers(projectId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트 팀원 목록을 조회했습니다.", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> addMember(
            @PathVariable("id") Long projectId,
            @Valid @RequestBody ProjectMemberCreateRequest request
    ) {
        ProjectMemberResponse response = projectService.addProjectMember(projectId, request);
        return ResponseEntity.ok(ApiResponse.success("프로젝트 팀원을 추가했습니다.", response));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable("id") Long projectId,
            @PathVariable("memberId") Long memberId
    ) {
        projectService.removeProjectMember(projectId, memberId);
        return ResponseEntity.ok(ApiResponse.success("프로젝트 팀원을 제거했습니다."));
    }
}

