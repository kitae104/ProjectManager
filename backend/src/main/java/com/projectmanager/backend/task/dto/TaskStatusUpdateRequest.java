package com.projectmanager.backend.task.dto;

import com.projectmanager.backend.task.domain.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull(message = "업무 상태는 필수입니다.")
        TaskStatus status
) {
}

