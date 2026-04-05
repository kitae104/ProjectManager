package com.projectmanager.backend.auth.dto;

import com.projectmanager.backend.user.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "이름은 필수입니다.")
        @Size(max = 100, message = "이름은 100자 이하로 입력해 주세요.")
        String name,
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "유효한 이메일 형식이 아닙니다.")
        @Size(max = 150, message = "이메일은 150자 이하로 입력해 주세요.")
        String email,
        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, max = 100, message = "비밀번호는 8자 이상 100자 이하로 입력해 주세요.")
        String password,
        @NotNull(message = "역할은 필수입니다.")
        UserRole role,
        @Size(max = 100, message = "소속은 100자 이하로 입력해 주세요.")
        String department
) {
}

