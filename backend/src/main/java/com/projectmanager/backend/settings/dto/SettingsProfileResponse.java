package com.projectmanager.backend.settings.dto;

import com.projectmanager.backend.user.domain.UserRole;

public record SettingsProfileResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        String department,
        String profileImage
) {
}
