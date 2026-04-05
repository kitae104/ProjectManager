package com.projectmanager.backend.auth.api;

import com.projectmanager.backend.auth.application.AuthService;
import com.projectmanager.backend.auth.dto.AuthTokenResponse;
import com.projectmanager.backend.auth.dto.LoginRequest;
import com.projectmanager.backend.auth.dto.SignupRequest;
import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        AuthTokenResponse response = authService.signup(request);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthTokenResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthTokenResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("로그인이 완료되었습니다.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(
                AuthenticationUtils.extractAuthenticatedUser(authentication)
        );
        return ResponseEntity.ok(ApiResponse.success("내 정보를 조회했습니다.", response));
    }
}

