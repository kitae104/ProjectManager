package com.projectmanager.backend.project.api;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.project.application.ProjectService;
import com.projectmanager.backend.project.dto.ProjectCreateRequest;
import com.projectmanager.backend.project.dto.ProjectResponse;
import com.projectmanager.backend.project.dto.ProjectUpdateRequest;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(Authentication authentication) {
        AuthenticatedUser authenticatedUser = AuthenticationUtils.extractAuthenticatedUser(authentication);
        List<ProjectResponse> response = projectService.getProjects(authenticatedUser);
        return ResponseEntity.ok(ApiResponse.success("Project list loaded.", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectCreateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = AuthenticationUtils.extractAuthenticatedUser(authentication);
        ProjectResponse response = projectService.createProject(request, authenticatedUser);
        return ResponseEntity.ok(ApiResponse.success("Project created.", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = AuthenticationUtils.extractAuthenticatedUser(authentication);
        ProjectResponse response = projectService.getProject(id, authenticatedUser);
        return ResponseEntity.ok(ApiResponse.success("Project loaded.", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProjectUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = AuthenticationUtils.extractAuthenticatedUser(authentication);
        ProjectResponse response = projectService.updateProject(id, request, authenticatedUser);
        return ResponseEntity.ok(ApiResponse.success("Project updated.", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = AuthenticationUtils.extractAuthenticatedUser(authentication);
        projectService.deleteProject(id, authenticatedUser);
        return ResponseEntity.ok(ApiResponse.success("Project deleted."));
    }
}
