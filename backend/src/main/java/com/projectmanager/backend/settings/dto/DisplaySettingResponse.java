package com.projectmanager.backend.settings.dto;

import com.projectmanager.backend.settings.domain.UserDisplaySetting;

public record DisplaySettingResponse(
        UserDisplaySetting.Theme theme,
        boolean sidebarCollapsedDefault
) {
    public static DisplaySettingResponse from(UserDisplaySetting setting) {
        return new DisplaySettingResponse(
                setting.getTheme(),
                setting.isSidebarCollapsedDefault()
        );
    }
}
