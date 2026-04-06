package com.projectmanager.backend.settings.dto;

import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectDefaultSettingUpdateRequest(
        @NotNull(message = "defaultCategory is required.")
        ProjectCategory defaultCategory,
        @NotNull(message = "defaultStatus is required.")
        ProjectStatus defaultStatus,
        @NotBlank(message = "defaultDescriptionTemplate is required.")
        String defaultDescriptionTemplate,
        @NotNull(message = "roleAutoSuggestionEnabled is required.")
        Boolean roleAutoSuggestionEnabled,
        @NotBlank(message = "defaultMilestoneTemplate is required.")
        @Size(max = 1000, message = "defaultMilestoneTemplate must be 1000 characters or fewer.")
        String defaultMilestoneTemplate
) {
}
