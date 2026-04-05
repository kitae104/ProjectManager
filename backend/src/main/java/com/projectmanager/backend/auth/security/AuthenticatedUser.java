package com.projectmanager.backend.auth.security;

import com.projectmanager.backend.user.domain.UserRole;

public record AuthenticatedUser(Long userId, String email, UserRole role) {
}

