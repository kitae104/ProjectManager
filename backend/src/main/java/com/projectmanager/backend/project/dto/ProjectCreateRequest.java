package com.projectmanager.backend.project.dto;

import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ProjectCreateRequest(
        @NotBlank(message = "프로젝트 제목은 필수입니다.")
        @Size(max = 200, message = "프로젝트 제목은 200자 이하로 입력해 주세요.")
        String title,
        @NotBlank(message = "프로젝트 설명은 필수입니다.")
        String description,
        @NotNull(message = "카테고리는 필수입니다.")
        ProjectCategory category,
        @NotNull(message = "상태는 필수입니다.")
        ProjectStatus status,
        @Size(max = 50, message = "학기는 50자 이하로 입력해 주세요.")
        String semester,
        LocalDate startDate,
        LocalDate endDate,
        @NotNull(message = "진행률은 필수입니다.")
        @Min(value = 0, message = "진행률은 0 이상이어야 합니다.")
        @Max(value = 100, message = "진행률은 100 이하여야 합니다.")
        Integer progress,
        Long leaderId
) {
}

