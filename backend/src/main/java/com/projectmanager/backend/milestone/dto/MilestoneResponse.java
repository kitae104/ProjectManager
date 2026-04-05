package com.projectmanager.backend.milestone.dto;

import com.projectmanager.backend.milestone.domain.Milestone;
import com.projectmanager.backend.milestone.domain.MilestoneStatus;
import java.time.Instant;
import java.time.LocalDate;

public record MilestoneResponse(
        Long id,
        Long projectId,
        String title,
        String description,
        LocalDate dueDate,
        MilestoneStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static MilestoneResponse from(Milestone milestone) {
        return new MilestoneResponse(
                milestone.getId(),
                milestone.getProject().getId(),
                milestone.getTitle(),
                milestone.getDescription(),
                milestone.getDueDate(),
                milestone.getStatus(),
                milestone.getCreatedAt(),
                milestone.getUpdatedAt()
        );
    }
}

