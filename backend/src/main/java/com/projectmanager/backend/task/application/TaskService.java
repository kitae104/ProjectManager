package com.projectmanager.backend.task.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectMemberRepository;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.task.domain.Task;
import com.projectmanager.backend.task.domain.TaskRepository;
import com.projectmanager.backend.task.dto.TaskCreateRequest;
import com.projectmanager.backend.task.dto.TaskResponse;
import com.projectmanager.backend.task.dto.TaskStatusUpdateRequest;
import com.projectmanager.backend.task.dto.TaskUpdateRequest;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskResponse createTask(
            Long projectId,
            TaskCreateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = findProject(projectId);
        validateCanManageProjectTasks(authenticatedUser, project);

        User assignee = findUserNullable(request.assigneeId());
        validateProjectParticipant(projectId, assignee, "담당자는 프로젝트 팀원이어야 합니다.");

        User reporter = findReporter(request.reporterId(), authenticatedUser.userId());
        validateProjectParticipant(projectId, reporter, "보고자는 프로젝트 참여자여야 합니다.");

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
    public List<TaskResponse> getProjectTasks(Long projectId, AuthenticatedUser authenticatedUser) {
        Project project = findProject(projectId);
        validateCanViewProject(authenticatedUser, project);

        return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long taskId, AuthenticatedUser authenticatedUser) {
        Task task = findTask(taskId);
        validateCanViewProject(authenticatedUser, task.getProject());
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateTask(
            Long taskId,
            TaskUpdateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Task task = findTask(taskId);
        Project project = task.getProject();

        if (canManageProjectTasks(authenticatedUser, project)) {
            User assignee = findUserNullable(request.assigneeId());
            validateProjectParticipant(project.getId(), assignee, "담당자는 프로젝트 팀원이어야 합니다.");

            User reporter = findReporter(request.reporterId(), authenticatedUser.userId());
            validateProjectParticipant(project.getId(), reporter, "보고자는 프로젝트 참여자여야 합니다.");

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

        if (canMemberUpdateOwnTask(authenticatedUser, task)) {
            task.update(
                    task.getTitle(),
                    task.getDescription(),
                    request.status(),
                    task.getPriority(),
                    task.getAssignee(),
                    task.getReporter(),
                    request.startDate(),
                    request.dueDate(),
                    request.progress()
            );
            return TaskResponse.from(task);
        }

        throw forbidden("업무는 프로젝트 팀장 또는 담당 팀원만 수정할 수 있습니다.");
    }

    @Transactional
    public TaskResponse updateTaskStatus(
            Long taskId,
            TaskStatusUpdateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Task task = findTask(taskId);

        if (canManageProjectTasks(authenticatedUser, task.getProject())
                || canMemberUpdateOwnTask(authenticatedUser, task)) {
            task.updateStatus(request.status());
            return TaskResponse.from(task);
        }

        throw forbidden("업무 상태는 프로젝트 팀장 또는 담당 팀원만 변경할 수 있습니다.");
    }

    @Transactional
    public void deleteTask(Long taskId, AuthenticatedUser authenticatedUser) {
        Task task = findTask(taskId);
        validateCanManageProjectTasks(authenticatedUser, task.getProject());
        taskRepository.delete(task);
    }

    private void validateCanViewProject(AuthenticatedUser authenticatedUser, Project project) {
        if (authenticatedUser.role() == UserRole.ADMIN) {
            return;
        }

        if (canManageProjectTasks(authenticatedUser, project)) {
            return;
        }

        if (authenticatedUser.role() == UserRole.MEMBER
                && projectMemberRepository.existsByProjectIdAndUserId(project.getId(), authenticatedUser.userId())) {
            return;
        }

        throw forbidden("해당 프로젝트 업무를 조회할 권한이 없습니다.");
    }

    private void validateCanManageProjectTasks(AuthenticatedUser authenticatedUser, Project project) {
        if (!canManageProjectTasks(authenticatedUser, project)) {
            throw forbidden("프로젝트 팀장만 업무를 관리할 수 있습니다.");
        }
    }

    private boolean canManageProjectTasks(AuthenticatedUser authenticatedUser, Project project) {
        return authenticatedUser.role() == UserRole.LEADER
                && project.getLeader() != null
                && project.getLeader().getId().equals(authenticatedUser.userId());
    }

    private boolean canMemberUpdateOwnTask(AuthenticatedUser authenticatedUser, Task task) {
        return authenticatedUser.role() == UserRole.MEMBER
                && task.getAssignee() != null
                && task.getAssignee().getId().equals(authenticatedUser.userId());
    }

    private void validateProjectParticipant(Long projectId, User user, String message) {
        if (user == null) {
            return;
        }

        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new IllegalArgumentException(message);
        }
    }

    private AccessDeniedException forbidden(String message) {
        return new AccessDeniedException(message);
    }

    private Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
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
