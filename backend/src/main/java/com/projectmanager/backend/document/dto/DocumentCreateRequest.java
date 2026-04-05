package com.projectmanager.backend.document.dto;

import com.projectmanager.backend.document.domain.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DocumentCreateRequest(
        @NotBlank(message = "문서 제목은 필수입니다.")
        @Size(max = 200, message = "문서 제목은 200자 이하로 입력해 주세요.")
        String title,
        @NotNull(message = "문서 타입은 필수입니다.")
        DocumentType type,
        @NotBlank(message = "문서 내용은 필수입니다.")
        String content,
        @NotBlank(message = "문서 버전은 필수입니다.")
        @Size(max = 30, message = "문서 버전은 30자 이하로 입력해 주세요.")
        String version
) {
}

