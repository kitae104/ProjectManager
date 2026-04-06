package com.projectmanager.backend.settings.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Entity
@Table(name = "admin_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_change_approval_required", nullable = false)
    private boolean roleChangeApprovalRequired;

    @Column(name = "viewer_project_creation_allowed", nullable = false)
    private boolean viewerProjectCreationAllowed;

    @Column(name = "cors_security_policy_note", nullable = false, length = 300)
    private String corsSecurityPolicyNote;

    @Column(name = "file_upload_limit_mb", nullable = false)
    private Integer fileUploadLimitMb;

    @Column(name = "default_semester", nullable = false, length = 50)
    private String defaultSemester;

    @Column(name = "project_naming_rule", nullable = false, length = 200)
    private String projectNamingRule;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private AdminSetting(
            boolean roleChangeApprovalRequired,
            boolean viewerProjectCreationAllowed,
            String corsSecurityPolicyNote,
            Integer fileUploadLimitMb,
            String defaultSemester,
            String projectNamingRule
    ) {
        this.roleChangeApprovalRequired = roleChangeApprovalRequired;
        this.viewerProjectCreationAllowed = viewerProjectCreationAllowed;
        this.corsSecurityPolicyNote = corsSecurityPolicyNote;
        this.fileUploadLimitMb = fileUploadLimitMb;
        this.defaultSemester = defaultSemester;
        this.projectNamingRule = projectNamingRule;
    }

    public static AdminSetting createDefault() {
        return new AdminSetting(
                true,
                false,
                "Production must use explicit CORS allowlist and strict security headers.",
                20,
                "2026-1",
                "[semester]-[team]-[topic]"
        );
    }

    public void update(
            boolean roleChangeApprovalRequired,
            boolean viewerProjectCreationAllowed,
            String corsSecurityPolicyNote,
            Integer fileUploadLimitMb,
            String defaultSemester,
            String projectNamingRule
    ) {
        this.roleChangeApprovalRequired = roleChangeApprovalRequired;
        this.viewerProjectCreationAllowed = viewerProjectCreationAllowed;
        this.corsSecurityPolicyNote = corsSecurityPolicyNote;
        this.fileUploadLimitMb = fileUploadLimitMb;
        this.defaultSemester = defaultSemester;
        this.projectNamingRule = projectNamingRule;
    }
}
