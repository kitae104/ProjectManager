package com.projectmanager.backend.meetingnote.dto;

import com.projectmanager.backend.meetingnote.domain.MeetingNote;
import java.time.Instant;
import java.time.LocalDateTime;

public record MeetingNoteResponse(
        Long id,
        Long projectId,
        String title,
        LocalDateTime meetingDateTime,
        String attendees,
        String content,
        String summary,
        Long authorId,
        String authorName,
        Instant createdAt,
        Instant updatedAt
) {
    public static MeetingNoteResponse from(MeetingNote note) {
        return new MeetingNoteResponse(
                note.getId(),
                note.getProject().getId(),
                note.getTitle(),
                note.getMeetingDateTime(),
                note.getAttendees(),
                note.getContent(),
                note.getSummary(),
                note.getAuthor().getId(),
                note.getAuthor().getName(),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }
}

