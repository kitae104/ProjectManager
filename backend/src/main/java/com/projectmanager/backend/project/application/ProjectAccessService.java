package com.projectmanager.backend.project.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectMemberRepository;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.user.domain.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectAccessService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
    }

    public void validateCanViewProject(AuthenticatedUser authenticatedUser, Project project) {
        if (authenticatedUser.role() == UserRole.ADMIN) {
            return;
        }

        if (isProjectLeader(authenticatedUser, project)) {
            return;
        }

        if (authenticatedUser.role() == UserRole.MEMBER
                && projectMemberRepository.existsByProjectIdAndUserId(project.getId(), authenticatedUser.userId())) {
            return;
        }

        throw forbidden("해당 프로젝트를 조회할 권한이 없습니다.");
    }

    public void validateCanManageProject(AuthenticatedUser authenticatedUser, Project project) {
        if (!isProjectLeader(authenticatedUser, project)) {
            throw forbidden("프로젝트 관리 권한이 없습니다.");
        }
    }

    private boolean isProjectLeader(AuthenticatedUser authenticatedUser, Project project) {
        return authenticatedUser.role() == UserRole.LEADER
                && project.getLeader() != null
                && project.getLeader().getId().equals(authenticatedUser.userId());
    }

    private AccessDeniedException forbidden(String message) {
        return new AccessDeniedException(message);
    }
}
