package com.projectmanager.backend.task.domain;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.user.domain.User;
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
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Entity
@Table(name = "tasks")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Task {

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
    @Column(nullable = false, length = 30)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TaskPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private Integer progress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Task(
            Project project,
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            User reporter,
            LocalDate startDate,
            LocalDate dueDate,
            Integer progress
    ) {
        this.project = project;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.assignee = assignee;
        this.reporter = reporter;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.progress = progress;
    }

    public static Task create(
            Project project,
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            User reporter,
            LocalDate startDate,
            LocalDate dueDate,
            Integer progress
    ) {
        return new Task(
                project,
                title,
                description,
                status,
                priority,
                assignee,
                reporter,
                startDate,
                dueDate,
                progress
        );
    }

    public void update(
            String title,
            String description,
            TaskStatus status,
            TaskPriority priority,
            User assignee,
            User reporter,
            LocalDate startDate,
            LocalDate dueDate,
            Integer progress
    ) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.assignee = assignee;
        this.reporter = reporter;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.progress = progress;
    }

    public void updateStatus(TaskStatus status) {
        this.status = status;
    }
}

