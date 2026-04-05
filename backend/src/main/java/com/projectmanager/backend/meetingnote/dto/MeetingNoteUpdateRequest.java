package com.projectmanager.backend.meetingnote.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record MeetingNoteUpdateRequest(
        @NotBlank(message = "회의 제목은 필수입니다.")
        @Size(max = 200, message = "회의 제목은 200자 이하로 입력해 주세요.")
        String title,
        @NotNull(message = "회의 일시는 필수입니다.")
        LocalDateTime meetingDateTime,
        @NotBlank(message = "참석자는 필수입니다.")
        String attendees,
        @NotBlank(message = "회의 내용은 필수입니다.")
        String content,
        String summary
) {
}

