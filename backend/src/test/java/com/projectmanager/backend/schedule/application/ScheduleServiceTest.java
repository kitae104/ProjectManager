package com.projectmanager.backend.schedule.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.schedule.domain.ScheduleType;
import com.projectmanager.backend.schedule.dto.ScheduleCreateRequest;
import com.projectmanager.backend.schedule.dto.ScheduleResponse;
import com.projectmanager.backend.schedule.dto.ScheduleUpdateRequest;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class ScheduleServiceTest {

    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateAndUpdateSchedule() {
        String suffix = String.valueOf(System.nanoTime());
        User leader = userRepository.save(
                User.create(
                        "Schedule Leader",
                        "schedule-leader-" + suffix + "@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );

        Project project = projectRepository.save(
                Project.create(
                        "Schedule Test Project",
                        "Schedule 테스트용 프로젝트",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        null,
                        null,
                        30,
                        leader
                )
        );

        ScheduleResponse created = scheduleService.createSchedule(
                project.getId(),
                new ScheduleCreateRequest(
                        "멘토링 세션",
                        "중간 점검 멘토링",
                        ScheduleType.MENTORING,
                        LocalDateTime.of(2026, 5, 3, 14, 0),
                        LocalDateTime.of(2026, 5, 3, 15, 0),
                        "공학관 402호"
                )
        );

        assertNotNull(created.id());
        assertEquals(ScheduleType.MENTORING, created.scheduleType());

        ScheduleResponse updated = scheduleService.updateSchedule(
                created.id(),
                new ScheduleUpdateRequest(
                        "멘토링 세션",
                        "최종 점검 멘토링",
                        ScheduleType.INTERNAL_REVIEW,
                        LocalDateTime.of(2026, 5, 4, 15, 0),
                        LocalDateTime.of(2026, 5, 4, 16, 0),
                        "공학관 501호"
                )
        );

        assertEquals(ScheduleType.INTERNAL_REVIEW, updated.scheduleType());
        assertEquals(LocalDateTime.of(2026, 5, 4, 15, 0), updated.startDateTime());
    }
}

