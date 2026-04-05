package com.projectmanager.backend.project.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

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
                "프로젝트/팀원 관리 테스트",
                ProjectCategory.DEVELOPMENT,
                ProjectStatus.IN_PROGRESS,
                "2026-1",
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                10,
                leader.getId()
        );

        ProjectResponse createdProject = projectService.createProject(createRequest);
        assertNotNull(createdProject.id());
        assertEquals(leader.getId(), createdProject.leaderId());

        List<?> membersAfterCreate = projectService.getProjectMembers(createdProject.id());
        assertEquals(1, membersAfterCreate.size());

        projectService.addProjectMember(
                createdProject.id(),
                new ProjectMemberCreateRequest(member.getId(), ProjectMemberRole.FRONTEND, "UI 개발")
        );

        List<?> membersAfterAdd = projectService.getProjectMembers(createdProject.id());
        assertEquals(2, membersAfterAdd.size());
    }
}

