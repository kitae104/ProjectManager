package com.projectmanager.backend.task.api;

import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.task.application.TaskService;
import com.projectmanager.backend.task.dto.TaskCreateRequest;
import com.projectmanager.backend.task.dto.TaskResponse;
import com.projectmanager.backend.task.dto.TaskStatusUpdateRequest;
import com.projectmanager.backend.task.dto.TaskUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/api/projects/{id}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getProjectTasks(
            @PathVariable("id") Long projectId
    ) {
        List<TaskResponse> response = taskService.getProjectTasks(projectId);
        return ResponseEntity.ok(ApiResponse.success("업무 목록을 조회했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable("id") Long projectId,
            @Valid @RequestBody TaskCreateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = AuthenticationUtils.extractAuthenticatedUser(authentication);
        TaskResponse response = taskService.createTask(projectId, request, authenticatedUser.userId());
        return ResponseEntity.ok(ApiResponse.success("업무를 생성했습니다.", response));
    }

    @GetMapping("/api/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @PathVariable("taskId") Long taskId
    ) {
        TaskResponse response = taskService.getTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("업무 상세를 조회했습니다.", response));
    }

    @PutMapping("/api/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable("taskId") Long taskId,
            @Valid @RequestBody TaskUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser authenticatedUser = AuthenticationUtils.extractAuthenticatedUser(authentication);
        TaskResponse response = taskService.updateTask(taskId, request, authenticatedUser.userId());
        return ResponseEntity.ok(ApiResponse.success("업무를 수정했습니다.", response));
    }

    @DeleteMapping("/api/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable("taskId") Long taskId
    ) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("업무를 삭제했습니다."));
    }

    @PatchMapping("/api/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable("taskId") Long taskId,
            @Valid @RequestBody TaskStatusUpdateRequest request
    ) {
        TaskResponse response = taskService.updateTaskStatus(taskId, request);
        return ResponseEntity.ok(ApiResponse.success("업무 상태를 변경했습니다.", response));
    }
}

