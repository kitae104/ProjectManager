package com.projectmanager.backend.milestone.dto;

import com.projectmanager.backend.milestone.domain.MilestoneStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record MilestoneCreateRequest(
        @NotBlank(message = "마일스톤 제목은 필수입니다.")
        @Size(max = 200, message = "마일스톤 제목은 200자 이하로 입력해 주세요.")
        String title,
        @NotBlank(message = "마일스톤 설명은 필수입니다.")
        String description,
        @NotNull(message = "마감일은 필수입니다.")
        LocalDate dueDate,
        @NotNull(message = "마일스톤 상태는 필수입니다.")
        MilestoneStatus status
) {
}

