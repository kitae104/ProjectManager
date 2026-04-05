package com.projectmanager.backend.project.dto;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectStatus;
import java.time.Instant;
import java.time.LocalDate;

public record ProjectResponse(
        Long id,
        String title,
        String description,
        ProjectCategory category,
        ProjectStatus status,
        String semester,
        LocalDate startDate,
        LocalDate endDate,
        Integer progress,
        Long leaderId,
        String leaderName,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProjectResponse from(Project project) {
        Long leaderId = project.getLeader() == null ? null : project.getLeader().getId();
        String leaderName = project.getLeader() == null ? null : project.getLeader().getName();
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getCategory(),
                project.getStatus(),
                project.getSemester(),
                project.getStartDate(),
                project.getEndDate(),
                project.getProgress(),
                leaderId,
                leaderName,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}

