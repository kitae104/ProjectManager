package com.projectmanager.backend.project.api;

import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.project.application.ProjectService;
import com.projectmanager.backend.project.dto.ProjectCreateRequest;
import com.projectmanager.backend.project.dto.ProjectResponse;
import com.projectmanager.backend.project.dto.ProjectUpdateRequest;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects() {
        List<ProjectResponse> response = projectService.getProjects();
        return ResponseEntity.ok(ApiResponse.success("프로젝트 목록을 조회했습니다.", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectCreateRequest request
    ) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.ok(ApiResponse.success("프로젝트를 생성했습니다.", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable("id") Long id
    ) {
        ProjectResponse response = projectService.getProject(id);
        return ResponseEntity.ok(ApiResponse.success("프로젝트 상세를 조회했습니다.", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProjectUpdateRequest request
    ) {
        ProjectResponse response = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success("프로젝트를 수정했습니다.", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable("id") Long id
    ) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("프로젝트를 삭제했습니다."));
    }
}

