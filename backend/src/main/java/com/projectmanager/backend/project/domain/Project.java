package com.projectmanager.backend.project.domain;

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
@Table(name = "projects")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectStatus status;

    @Column(length = 50)
    private String semester;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer progress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id")
    private User leader;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Project(
            String title,
            String description,
            ProjectCategory category,
            ProjectStatus status,
            String semester,
            LocalDate startDate,
            LocalDate endDate,
            Integer progress,
            User leader
    ) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.semester = semester;
        this.startDate = startDate;
        this.endDate = endDate;
        this.progress = progress;
        this.leader = leader;
    }

    public static Project create(
            String title,
            String description,
            ProjectCategory category,
            ProjectStatus status,
            String semester,
            LocalDate startDate,
            LocalDate endDate,
            Integer progress,
            User leader
    ) {
        return new Project(
                title,
                description,
                category,
                status,
                semester,
                startDate,
                endDate,
                progress,
                leader
        );
    }

    public void update(
            String title,
            String description,
            ProjectCategory category,
            ProjectStatus status,
            String semester,
            LocalDate startDate,
            LocalDate endDate,
            Integer progress,
            User leader
    ) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.semester = semester;
        this.startDate = startDate;
        this.endDate = endDate;
        this.progress = progress;
        this.leader = leader;
    }
}

