package com.projectmanager.backend.settings.dto;

import com.projectmanager.backend.settings.domain.UserDisplaySetting;
import jakarta.validation.constraints.NotNull;

public record DisplaySettingUpdateRequest(
        @NotNull(message = "theme is required.")
        UserDisplaySetting.Theme theme,
        @NotNull(message = "sidebarCollapsedDefault is required.")
        Boolean sidebarCollapsedDefault
) {
}
