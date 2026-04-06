package com.projectmanager.backend.artifact.domain;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Entity
@Table(name = "artifacts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Artifact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "content_type", length = 150)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Lob
    @Column(name = "file_data", nullable = false)
    private byte[] fileData;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private Artifact(
            Project project,
            String originalFileName,
            String contentType,
            Long fileSize,
            User uploader,
            byte[] fileData
    ) {
        this.project = project;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploader = uploader;
        this.fileData = fileData;
    }

    public static Artifact create(
            Project project,
            String originalFileName,
            String contentType,
            Long fileSize,
            User uploader,
            byte[] fileData
    ) {
        return new Artifact(project, originalFileName, contentType, fileSize, uploader, fileData);
    }
}

