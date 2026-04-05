package com.projectmanager.backend.schedule.dto;

import com.projectmanager.backend.schedule.domain.Schedule;
import com.projectmanager.backend.schedule.domain.ScheduleType;
import java.time.Instant;
import java.time.LocalDateTime;

public record ScheduleResponse(
        Long id,
        Long projectId,
        String title,
        String description,
        ScheduleType scheduleType,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        String location,
        Instant createdAt,
        Instant updatedAt
) {
    public static ScheduleResponse from(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getProject().getId(),
                schedule.getTitle(),
                schedule.getDescription(),
                schedule.getScheduleType(),
                schedule.getStartDateTime(),
                schedule.getEndDateTime(),
                schedule.getLocation(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt()
        );
    }
}

