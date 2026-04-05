package com.projectmanager.backend.task.dto;

import com.projectmanager.backend.task.domain.Task;
import com.projectmanager.backend.task.domain.TaskPriority;
import com.projectmanager.backend.task.domain.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        Long projectId,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        Long assigneeId,
        String assigneeName,
        Long reporterId,
        String reporterName,
        LocalDate startDate,
        LocalDate dueDate,
        Integer progress,
        Instant createdAt,
        Instant updatedAt
) {
    public static TaskResponse from(Task task) {
        Long assigneeId = task.getAssignee() == null ? null : task.getAssignee().getId();
        String assigneeName = task.getAssignee() == null ? null : task.getAssignee().getName();
        Long reporterId = task.getReporter() == null ? null : task.getReporter().getId();
        String reporterName = task.getReporter() == null ? null : task.getReporter().getName();

        return new TaskResponse(
                task.getId(),
                task.getProject().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                assigneeId,
                assigneeName,
                reporterId,
                reporterName,
                task.getStartDate(),
                task.getDueDate(),
                task.getProgress(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}

