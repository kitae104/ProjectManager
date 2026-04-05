package com.projectmanager.backend.schedule.domain;

import com.projectmanager.backend.project.domain.Project;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Entity
@Table(name = "schedules")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false, length = 30)
    private ScheduleType scheduleType;

    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDateTime;

    @Column(length = 200)
    private String location;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Schedule(
            Project project,
            String title,
            String description,
            ScheduleType scheduleType,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            String location
    ) {
        this.project = project;
        this.title = title;
        this.description = description;
        this.scheduleType = scheduleType;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.location = location;
    }

    public static Schedule create(
            Project project,
            String title,
            String description,
            ScheduleType scheduleType,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            String location
    ) {
        return new Schedule(project, title, description, scheduleType, startDateTime, endDateTime, location);
    }

    public void update(
            String title,
            String description,
            ScheduleType scheduleType,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            String location
    ) {
        this.title = title;
        this.description = description;
        this.scheduleType = scheduleType;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.location = location;
    }
}

