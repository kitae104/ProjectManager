package com.projectmanager.backend.task.dto;

import com.projectmanager.backend.task.domain.TaskPriority;
import com.projectmanager.backend.task.domain.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TaskUpdateRequest(
        @NotBlank(message = "업무 제목은 필수입니다.")
        @Size(max = 200, message = "업무 제목은 200자 이하로 입력해 주세요.")
        String title,
        @NotBlank(message = "업무 설명은 필수입니다.")
        String description,
        @NotNull(message = "업무 상태는 필수입니다.")
        TaskStatus status,
        @NotNull(message = "우선순위는 필수입니다.")
        TaskPriority priority,
        Long assigneeId,
        Long reporterId,
        LocalDate startDate,
        LocalDate dueDate,
        @NotNull(message = "진행률은 필수입니다.")
        @Min(value = 0, message = "진행률은 0 이상이어야 합니다.")
        @Max(value = 100, message = "진행률은 100 이하여야 합니다.")
        Integer progress
) {
}

