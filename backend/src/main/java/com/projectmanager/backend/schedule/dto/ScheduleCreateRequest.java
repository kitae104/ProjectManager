package com.projectmanager.backend.schedule.dto;

import com.projectmanager.backend.schedule.domain.ScheduleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record ScheduleCreateRequest(
        @NotBlank(message = "일정 제목은 필수입니다.")
        @Size(max = 200, message = "일정 제목은 200자 이하로 입력해 주세요.")
        String title,
        @NotBlank(message = "일정 설명은 필수입니다.")
        String description,
        @NotNull(message = "일정 종류는 필수입니다.")
        ScheduleType scheduleType,
        @NotNull(message = "시작 일시는 필수입니다.")
        LocalDateTime startDateTime,
        @NotNull(message = "종료 일시는 필수입니다.")
        LocalDateTime endDateTime,
        @Size(max = 200, message = "장소는 200자 이하로 입력해 주세요.")
        String location
) {
}

