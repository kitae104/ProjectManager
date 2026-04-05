package com.projectmanager.backend.auth.security;

import org.springframework.security.core.Authentication;

public final class AuthenticationUtils {

    private AuthenticationUtils() {
    }

    public static AuthenticatedUser extractAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new IllegalArgumentException("인증 정보가 유효하지 않습니다.");
        }
        return principal;
    }
}

