package com.projectmanager.backend.settings.dto;

import com.projectmanager.backend.settings.domain.UserNotificationSetting;

public record NotificationSettingResponse(
        boolean deadlineAlertEnabled,
        boolean blockedTaskAlertEnabled,
        boolean meetingScheduleAlertEnabled
) {
    public static NotificationSettingResponse from(UserNotificationSetting setting) {
        return new NotificationSettingResponse(
                setting.isDeadlineAlertEnabled(),
                setting.isBlockedTaskAlertEnabled(),
                setting.isMeetingScheduleAlertEnabled()
        );
    }
}
