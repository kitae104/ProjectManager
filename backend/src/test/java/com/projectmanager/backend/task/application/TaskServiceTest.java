package com.projectmanager.backend.task.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.task.domain.TaskPriority;
import com.projectmanager.backend.task.domain.TaskStatus;
import com.projectmanager.backend.task.dto.TaskCreateRequest;
import com.projectmanager.backend.task.dto.TaskResponse;
import com.projectmanager.backend.task.dto.TaskStatusUpdateRequest;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class TaskServiceTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateTaskAndUpdateStatus() {
        User reporter = userRepository.save(
                User.create(
                        "Reporter",
                        "task-reporter@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.MEMBER,
                        "CS"
                )
        );

        User assignee = userRepository.save(
                User.create(
                        "Assignee",
                        "task-assignee@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.MEMBER,
                        "CS"
                )
        );

        Project project = projectRepository.save(
                Project.create(
                        "Task Test Project",
                        "Task 테스트용 프로젝트",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        null,
                        null,
                        10,
                        reporter
                )
        );

        TaskCreateRequest createRequest = new TaskCreateRequest(
                "Task 1",
                "첫 번째 업무",
                TaskStatus.TODO,
                TaskPriority.HIGH,
                assignee.getId(),
                reporter.getId(),
                null,
                null,
                0
        );

        TaskResponse createdTask = taskService.createTask(project.getId(), createRequest, reporter.getId());
        assertNotNull(createdTask.id());
        assertEquals(TaskStatus.TODO, createdTask.status());
        assertEquals(TaskPriority.HIGH, createdTask.priority());
        assertEquals(assignee.getId(), createdTask.assigneeId());

        TaskResponse updatedStatusTask = taskService.updateTaskStatus(
                createdTask.id(),
                new TaskStatusUpdateRequest(TaskStatus.IN_PROGRESS)
        );
        assertEquals(TaskStatus.IN_PROGRESS, updatedStatusTask.status());
    }
}

