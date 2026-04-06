package com.projectmanager.backend.settings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SettingsProfileUpdateRequest(
        @NotBlank(message = "Name is required.")
        @Size(max = 100, message = "Name must be 100 characters or fewer.")
        String name,
        @Size(max = 100, message = "Department must be 100 characters or fewer.")
        String department,
        @Size(max = 500, message = "Profile image URL must be 500 characters or fewer.")
        String profileImage
) {
}
