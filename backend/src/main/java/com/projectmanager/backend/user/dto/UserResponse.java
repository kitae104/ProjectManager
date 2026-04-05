package com.projectmanager.backend.user.dto;

import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRole;

public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        String department,
        String profileImage
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getProfileImage()
        );
    }
}

