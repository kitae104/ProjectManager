package com.projectmanager.backend.milestone.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.milestone.domain.MilestoneStatus;
import com.projectmanager.backend.milestone.dto.MilestoneCreateRequest;
import com.projectmanager.backend.milestone.dto.MilestoneResponse;
import com.projectmanager.backend.milestone.dto.MilestoneUpdateRequest;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class MilestoneServiceTest {

    @Autowired
    private MilestoneService milestoneService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateAndUpdateMilestone() {
        String suffix = String.valueOf(System.nanoTime());
        User leader = userRepository.save(
                User.create(
                        "Milestone Leader",
                        "milestone-leader-" + suffix + "@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );

        Project project = projectRepository.save(
                Project.create(
                        "Milestone Test Project",
                        "Milestone 테스트용 프로젝트",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        null,
                        null,
                        20,
                        leader
                )
        );

        AuthenticatedUser leaderAuth = new AuthenticatedUser(
                leader.getId(),
                leader.getEmail(),
                leader.getRole()
        );

        MilestoneResponse created = milestoneService.createMilestone(
                project.getId(),
                new MilestoneCreateRequest(
                        "중간 발표 준비",
                        "중간 발표 자료 초안 완료",
                        LocalDate.of(2026, 5, 10),
                        MilestoneStatus.PLANNED
                ),
                leaderAuth
        );

        assertNotNull(created.id());
        assertEquals(MilestoneStatus.PLANNED, created.status());

        MilestoneResponse updated = milestoneService.updateMilestone(
                created.id(),
                new MilestoneUpdateRequest(
                        "중간 발표 준비",
                        "중간 발표 자료 최종본",
                        LocalDate.of(2026, 5, 12),
                        MilestoneStatus.IN_PROGRESS
                ),
                leaderAuth
        );

        assertEquals(MilestoneStatus.IN_PROGRESS, updated.status());
        assertEquals(LocalDate.of(2026, 5, 12), updated.dueDate());
    }
}
