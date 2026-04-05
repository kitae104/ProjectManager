package com.projectmanager.backend.task.application;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.task.domain.Task;
import com.projectmanager.backend.task.domain.TaskRepository;
import com.projectmanager.backend.task.dto.TaskCreateRequest;
import com.projectmanager.backend.task.dto.TaskResponse;
import com.projectmanager.backend.task.dto.TaskStatusUpdateRequest;
import com.projectmanager.backend.task.dto.TaskUpdateRequest;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskResponse createTask(Long projectId, TaskCreateRequest request, Long authenticatedUserId) {
        Project project = findProject(projectId);
        User assignee = findUserNullable(request.assigneeId());
        User reporter = findReporter(request.reporterId(), authenticatedUserId);

        Task task = Task.create(
                project,
                request.title(),
                request.description(),
                request.status(),
                request.priority(),
                assignee,
                reporter,
                request.startDate(),
                request.dueDate(),
                request.progress()
        );
        Task savedTask = taskRepository.save(task);
        return TaskResponse.from(savedTask);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(Long projectId) {
        ensureProjectExists(projectId);
        return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long taskId) {
        return TaskResponse.from(findTask(taskId));
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskUpdateRequest request, Long authenticatedUserId) {
        Task task = findTask(taskId);
        User assignee = findUserNullable(request.assigneeId());
        User reporter = findReporter(request.reporterId(), authenticatedUserId);

        task.update(
                request.title(),
                request.description(),
                request.status(),
                request.priority(),
                assignee,
                reporter,
                request.startDate(),
                request.dueDate(),
                request.progress()
        );
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatusUpdateRequest request) {
        Task task = findTask(taskId);
        task.updateStatus(request.status());
        return TaskResponse.from(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("업무를 찾을 수 없습니다.");
        }
        taskRepository.deleteById(taskId);
    }

    private Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
    }

    private void ensureProjectExists(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다.");
        }
    }

    private Task findTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("업무를 찾을 수 없습니다."));
    }

    private User findUserNullable(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private User findReporter(Long reporterId, Long authenticatedUserId) {
        if (reporterId != null) {
            return findUserNullable(reporterId);
        }
        return findUserNullable(authenticatedUserId);
    }
}

