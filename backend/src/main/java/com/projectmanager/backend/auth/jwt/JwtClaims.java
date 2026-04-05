package com.projectmanager.backend.auth.jwt;

import com.projectmanager.backend.user.domain.UserRole;

public record JwtClaims(Long userId, String email, UserRole role) {
}

