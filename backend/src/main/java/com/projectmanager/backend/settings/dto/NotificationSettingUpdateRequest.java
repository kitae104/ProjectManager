package com.projectmanager.backend.settings.dto;

import jakarta.validation.constraints.NotNull;

public record NotificationSettingUpdateRequest(
        @NotNull(message = "deadlineAlertEnabled is required.")
        Boolean deadlineAlertEnabled,
        @NotNull(message = "blockedTaskAlertEnabled is required.")
        Boolean blockedTaskAlertEnabled,
        @NotNull(message = "meetingScheduleAlertEnabled is required.")
        Boolean meetingScheduleAlertEnabled
) {
}
