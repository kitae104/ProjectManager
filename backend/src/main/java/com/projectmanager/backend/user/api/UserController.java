package com.projectmanager.backend.user.api;

import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.user.application.UserService;
import com.projectmanager.backend.user.dto.UserResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(Authentication authentication) {
        UserResponse response = userService.getMe(
                AuthenticationUtils.extractAuthenticatedUser(authentication)
        );
        return ResponseEntity.ok(ApiResponse.success("내 정보를 조회했습니다.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        List<UserResponse> response = userService.getUsers();
        return ResponseEntity.ok(ApiResponse.success("사용자 목록을 조회했습니다.", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable("id") Long id) {
        UserResponse response = userService.getUser(id);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 조회했습니다.", response));
    }
}

