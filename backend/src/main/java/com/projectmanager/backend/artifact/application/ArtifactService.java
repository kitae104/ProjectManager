package com.projectmanager.backend.artifact.application;

import com.projectmanager.backend.artifact.domain.Artifact;
import com.projectmanager.backend.artifact.domain.ArtifactRepository;
import com.projectmanager.backend.artifact.dto.ArtifactResponse;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ArtifactService {

    private static final long MAX_FILE_SIZE_BYTES = 20L * 1024 * 1024;

    private final ArtifactRepository artifactRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ArtifactResponse> getProjectArtifacts(Long projectId) {
        ensureProjectExists(projectId);
        return artifactRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(ArtifactResponse::from)
                .toList();
    }

    @Transactional
    public ArtifactResponse uploadArtifact(Long projectId, MultipartFile file, Long userId) {
        Project project = findProject(projectId);
        User uploader = findUser(userId);
        validateUploadFile(file);

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException exception) {
            throw new IllegalArgumentException("파일을 읽는 중 오류가 발생했습니다.");
        }

        Artifact artifact = Artifact.create(
                project,
                file.getOriginalFilename() == null ? "unknown" : file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                uploader,
                fileBytes
        );
        Artifact savedArtifact = artifactRepository.save(artifact);
        return ArtifactResponse.from(savedArtifact);
    }

    @Transactional(readOnly = true)
    public ArtifactDownloadResult downloadArtifact(Long artifactId) {
        Artifact artifact = artifactRepository.findById(artifactId)
                .orElseThrow(() -> new IllegalArgumentException("산출물을 찾을 수 없습니다."));
        return new ArtifactDownloadResult(
                artifact.getOriginalFileName(),
                artifact.getContentType(),
                artifact.getFileData()
        );
    }

    @Transactional
    public void deleteArtifact(Long artifactId) {
        if (!artifactRepository.existsById(artifactId)) {
            throw new IllegalArgumentException("산출물을 찾을 수 없습니다.");
        }
        artifactRepository.deleteById(artifactId);
    }

    private void validateUploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어 있습니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("파일 크기는 20MB 이하여야 합니다.");
        }
    }

    private void ensureProjectExists(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다.");
        }
    }

    private Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    public record ArtifactDownloadResult(
            String originalFileName,
            String contentType,
            byte[] fileData
    ) {
    }
}

