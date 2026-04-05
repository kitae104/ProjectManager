package com.projectmanager.backend.auth.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.projectmanager.backend.user.domain.UserRole;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    @Test
    void shouldCreateAndParseAccessToken() {
        JwtTokenProvider tokenProvider = new JwtTokenProvider(
                "test-secret-key-test-secret-key-test-secret-key-test-secret-key",
                3600
        );

        String token = tokenProvider.createAccessToken(10L, "tester@example.com", UserRole.MEMBER);
        JwtClaims claims = tokenProvider.parse(token);

        assertEquals(10L, claims.userId());
        assertEquals("tester@example.com", claims.email());
        assertEquals(UserRole.MEMBER, claims.role());
    }
}

