package com.projectmanager.backend.project.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectMemberRepository;
import com.projectmanager.backend.project.domain.ProjectMemberRole;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.project.dto.ProjectCreateRequest;
import com.projectmanager.backend.project.dto.ProjectMemberCreateRequest;
import com.projectmanager.backend.project.dto.ProjectMemberResponse;
import com.projectmanager.backend.project.dto.ProjectResponse;
import com.projectmanager.backend.project.dto.ProjectUpdateRequest;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Test
    void shouldCreateProjectAndManageMembers() {
        User admin = userRepository.save(
                User.create(
                        "Admin",
                        "admin-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.ADMIN,
                        "CS"
                )
        );
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
                new AuthenticatedUser(admin.getId(), admin.getEmail(), admin.getRole())
        );
        assertNotNull(createdProject.id());
        assertEquals(leader.getId(), createdProject.leaderId());

        List<?> membersAfterCreate = projectService.getProjectMembers(
                createdProject.id(),
                new AuthenticatedUser(leader.getId(), leader.getEmail(), leader.getRole())
        );
        assertEquals(1, membersAfterCreate.size());

        projectService.addProjectMember(
                createdProject.id(),
                new ProjectMemberCreateRequest(member.getId(), ProjectMemberRole.FRONTEND, "UI development"),
                new AuthenticatedUser(leader.getId(), leader.getEmail(), leader.getRole())
        );

        List<?> membersAfterAdd = projectService.getProjectMembers(
                createdProject.id(),
                new AuthenticatedUser(leader.getId(), leader.getEmail(), leader.getRole())
        );
        assertEquals(2, membersAfterAdd.size());
    }

    @Test
    void shouldAllowAdminToChangeProjectLeader() {
        User admin = userRepository.save(
                User.create(
                        "Admin2",
                        "admin2-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.ADMIN,
                        "CS"
                )
        );
        User leaderA = userRepository.save(
                User.create(
                        "LeaderA",
                        "leader-a-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );
        User leaderB = userRepository.save(
                User.create(
                        "LeaderB",
                        "leader-b-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );

        ProjectResponse createdProject = projectService.createProject(
                new ProjectCreateRequest(
                        "Leader Switch Project",
                        "Leader switch test.",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.PLANNING,
                        "2026-1",
                        LocalDate.now(),
                        LocalDate.now().plusDays(10),
                        0,
                        leaderA.getId()
                ),
                new AuthenticatedUser(admin.getId(), admin.getEmail(), admin.getRole())
        );

        ProjectResponse updatedProject = projectService.updateProject(
                createdProject.id(),
                new ProjectUpdateRequest(
                        "Leader Switch Project Updated",
                        "Leader switched by admin.",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        LocalDate.now(),
                        LocalDate.now().plusDays(20),
                        20,
                        leaderB.getId()
                ),
                new AuthenticatedUser(admin.getId(), admin.getEmail(), admin.getRole())
        );

        assertEquals(leaderB.getId(), updatedProject.leaderId());

        List<ProjectMemberResponse> members = projectService.getProjectMembers(
                createdProject.id(),
                new AuthenticatedUser(admin.getId(), admin.getEmail(), admin.getRole())
        );
        List<ProjectMemberResponse> leaderMembers = members.stream()
                .filter(member -> member.projectRole() == ProjectMemberRole.LEADER)
                .toList();

        assertEquals(1, leaderMembers.size());
        assertEquals(leaderB.getId(), leaderMembers.get(0).userId());
    }

    @Test
    void shouldDeleteProjectAndRelatedMembersByAdmin() {
        User admin = userRepository.save(
                User.create(
                        "Admin3",
                        "admin3-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.ADMIN,
                        "CS"
                )
        );
        User leader = userRepository.save(
                User.create(
                        "Leader3",
                        "leader3-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );
        User member = userRepository.save(
                User.create(
                        "Member3",
                        "member3-project@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.MEMBER,
                        "CS"
                )
        );

        ProjectResponse createdProject = projectService.createProject(
                new ProjectCreateRequest(
                        "Delete Project",
                        "Delete with related entities test.",
                        ProjectCategory.CAPSTONE,
                        ProjectStatus.PLANNING,
                        "2026-1",
                        LocalDate.now(),
                        LocalDate.now().plusDays(15),
                        0,
                        leader.getId()
                ),
                new AuthenticatedUser(admin.getId(), admin.getEmail(), admin.getRole())
        );

        projectService.addProjectMember(
                createdProject.id(),
                new ProjectMemberCreateRequest(member.getId(), ProjectMemberRole.BACKEND, "API"),
                new AuthenticatedUser(leader.getId(), leader.getEmail(), leader.getRole())
        );

        assertEquals(2, projectMemberRepository.findByProjectId(createdProject.id()).size());

        projectService.deleteProject(
                createdProject.id(),
                new AuthenticatedUser(admin.getId(), admin.getEmail(), admin.getRole())
        );

        assertTrue(projectRepository.findById(createdProject.id()).isEmpty());
        assertTrue(projectMemberRepository.findByProjectId(createdProject.id()).isEmpty());
    }

}
