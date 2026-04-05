package com.projectmanager.backend.document.dto;

import com.projectmanager.backend.document.domain.DocumentType;
import com.projectmanager.backend.document.domain.ProjectDocument;
import java.time.Instant;

public record DocumentResponse(
        Long id,
        Long projectId,
        String title,
        DocumentType type,
        String content,
        String version,
        Long authorId,
        String authorName,
        Instant createdAt,
        Instant updatedAt
) {
    public static DocumentResponse from(ProjectDocument document) {
        return new DocumentResponse(
                document.getId(),
                document.getProject().getId(),
                document.getTitle(),
                document.getType(),
                document.getContent(),
                document.getVersion(),
                document.getAuthor().getId(),
                document.getAuthor().getName(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}

