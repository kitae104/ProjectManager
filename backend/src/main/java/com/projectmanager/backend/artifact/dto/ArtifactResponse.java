package com.projectmanager.backend.artifact.dto;

import com.projectmanager.backend.artifact.domain.Artifact;
import java.time.Instant;

public record ArtifactResponse(
        Long id,
        Long projectId,
        String originalFileName,
        String contentType,
        Long fileSize,
        Long uploaderId,
        String uploaderName,
        Instant createdAt
) {
    public static ArtifactResponse from(Artifact artifact) {
        return new ArtifactResponse(
                artifact.getId(),
                artifact.getProject().getId(),
                artifact.getOriginalFileName(),
                artifact.getContentType(),
                artifact.getFileSize(),
                artifact.getUploader().getId(),
                artifact.getUploader().getName(),
                artifact.getCreatedAt()
        );
    }
}

