package com.projectmanager.backend.project.dto;

import com.projectmanager.backend.project.domain.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectMemberCreateRequest(
        @NotNull(message = "사용자 ID는 필수입니다.")
        Long userId,
        @NotNull(message = "프로젝트 역할은 필수입니다.")
        ProjectMemberRole projectRole,
        @Size(max = 255, message = "책임 영역은 255자 이하로 입력해 주세요.")
        String responsibility
) {
}

