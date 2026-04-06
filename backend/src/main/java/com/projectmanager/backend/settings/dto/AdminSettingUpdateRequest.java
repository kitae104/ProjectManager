package com.projectmanager.backend.settings.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminSettingUpdateRequest(
        @NotNull(message = "roleChangeApprovalRequired is required.")
        Boolean roleChangeApprovalRequired,
        @NotNull(message = "viewerProjectCreationAllowed is required.")
        Boolean viewerProjectCreationAllowed,
        @NotBlank(message = "corsSecurityPolicyNote is required.")
        @Size(max = 300, message = "corsSecurityPolicyNote must be 300 characters or fewer.")
        String corsSecurityPolicyNote,
        @NotNull(message = "fileUploadLimitMb is required.")
        @Min(value = 1, message = "fileUploadLimitMb must be 1 or greater.")
        @Max(value = 1024, message = "fileUploadLimitMb must be 1024 or smaller.")
        Integer fileUploadLimitMb,
        @NotBlank(message = "defaultSemester is required.")
        @Size(max = 50, message = "defaultSemester must be 50 characters or fewer.")
        String defaultSemester,
        @NotBlank(message = "projectNamingRule is required.")
        @Size(max = 200, message = "projectNamingRule must be 200 characters or fewer.")
        String projectNamingRule
) {
}
