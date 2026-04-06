package com.projectmanager.backend.project.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectMemberRole;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.project.dto.ProjectCreateRequest;
import com.projectmanager.backend.project.dto.ProjectMemberCreateRequest;
import com.projectmanager.backend.project.dto.ProjectResponse;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateProjectAndManageMembers() {
        User leader = userRepository.save(
                User.create(
                        "Leader",
                        "leader-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );
        User member = userRepository.save(
                User.create(
                        "Member",
                        "member-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.MEMBER,
                        "CS"
                )
        );

        ProjectCreateRequest createRequest = new ProjectCreateRequest(
                "Phase3 Project",
                "Project/member management integration test.",
                ProjectCategory.DEVELOPMENT,
                ProjectStatus.IN_PROGRESS,
                "2026-1",
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                10,
                leader.getId()
        );

        ProjectResponse createdProject = projectService.createProject(
                createRequest,
                new AuthenticatedUser(leader.getId(), leader.getEmail(), leader.getRole())
        );
        assertNotNull(createdProject.id());
        assertEquals(leader.getId(), createdProject.leaderId());

        List<?> membersAfterCreate = projectService.getProjectMembers(createdProject.id());
        assertEquals(1, membersAfterCreate.size());

        projectService.addProjectMember(
                createdProject.id(),
                new ProjectMemberCreateRequest(member.getId(), ProjectMemberRole.FRONTEND, "UI development")
        );

        List<?> membersAfterAdd = projectService.getProjectMembers(createdProject.id());
        assertEquals(2, membersAfterAdd.size());
    }

    @Test
    void shouldBlockProjectCreationForViewerByDefault() {
        User viewer = userRepository.save(
                User.create(
                        "Viewer",
                        "viewer-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.VIEWER,
                        "CS"
                )
        );

        ProjectCreateRequest createRequest = new ProjectCreateRequest(
                "Viewer Trial Project",
                "This creation should be blocked by default policy.",
                ProjectCategory.DEVELOPMENT,
                ProjectStatus.PLANNING,
                "2026-1",
                null,
                null,
                0,
                viewer.getId()
        );

        assertThrows(
                AccessDeniedException.class,
                () -> projectService.createProject(
                        createRequest,
                        new AuthenticatedUser(viewer.getId(), viewer.getEmail(), viewer.getRole())
                )
        );
    }

    @Test
    void shouldReturnViewerCreationPolicyDefaultAsFalse() {
        assertFalse(projectService.getViewerProjectCreationPolicy().viewerProjectCreationAllowed());
    }
}
