package com.projectmanager.backend.auth.dto;

import com.projectmanager.backend.user.dto.UserResponse;

public record AuthTokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}

