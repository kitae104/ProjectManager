package com.projectmanager.backend.settings.dto;

import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.settings.domain.UserProjectDefaultSetting;

public record ProjectDefaultSettingResponse(
        ProjectCategory defaultCategory,
        ProjectStatus defaultStatus,
        String defaultDescriptionTemplate,
        boolean roleAutoSuggestionEnabled,
        String defaultMilestoneTemplate
) {
    public static ProjectDefaultSettingResponse from(UserProjectDefaultSetting setting) {
        return new ProjectDefaultSettingResponse(
                setting.getDefaultCategory(),
                setting.getDefaultStatus(),
                setting.getDefaultDescriptionTemplate(),
                setting.isRoleAutoSuggestionEnabled(),
                setting.getDefaultMilestoneTemplate()
        );
    }
}
