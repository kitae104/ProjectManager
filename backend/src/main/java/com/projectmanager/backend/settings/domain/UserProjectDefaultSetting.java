package com.projectmanager.backend.settings.domain;

import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectStatus;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Entity
@Table(name = "user_project_default_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProjectDefaultSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_category", nullable = false, length = 30)
    private ProjectCategory defaultCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_status", nullable = false, length = 30)
    private ProjectStatus defaultStatus;

    @Column(name = "default_description_template", nullable = false, columnDefinition = "TEXT")
    private String defaultDescriptionTemplate;

    @Column(name = "role_auto_suggestion_enabled", nullable = false)
    private boolean roleAutoSuggestionEnabled;

    @Column(name = "default_milestone_template", nullable = false, columnDefinition = "TEXT")
    private String defaultMilestoneTemplate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private UserProjectDefaultSetting(
            User user,
            ProjectCategory defaultCategory,
            ProjectStatus defaultStatus,
            String defaultDescriptionTemplate,
            boolean roleAutoSuggestionEnabled,
            String defaultMilestoneTemplate
    ) {
        this.user = user;
        this.defaultCategory = defaultCategory;
        this.defaultStatus = defaultStatus;
        this.defaultDescriptionTemplate = defaultDescriptionTemplate;
        this.roleAutoSuggestionEnabled = roleAutoSuggestionEnabled;
        this.defaultMilestoneTemplate = defaultMilestoneTemplate;
    }

    public static UserProjectDefaultSetting createDefault(User user) {
        return new UserProjectDefaultSetting(
                user,
                ProjectCategory.DEVELOPMENT,
                ProjectStatus.PLANNING,
                "프로젝트 목표, 범위, 핵심 산출물을 작성하세요.",
                true,
                "M1: 기획 완료\nM2: MVP 완료\nM3: 발표 준비 완료"
        );
    }

    public void update(
            ProjectCategory defaultCategory,
            ProjectStatus defaultStatus,
            String defaultDescriptionTemplate,
            boolean roleAutoSuggestionEnabled,
            String defaultMilestoneTemplate
    ) {
        this.defaultCategory = defaultCategory;
        this.defaultStatus = defaultStatus;
        this.defaultDescriptionTemplate = defaultDescriptionTemplate;
        this.roleAutoSuggestionEnabled = roleAutoSuggestionEnabled;
        this.defaultMilestoneTemplate = defaultMilestoneTemplate;
    }
}

