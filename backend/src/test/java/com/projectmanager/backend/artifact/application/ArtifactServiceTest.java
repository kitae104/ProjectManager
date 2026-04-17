package com.projectmanager.backend.artifact.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.artifact.dto.ArtifactResponse;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class ArtifactServiceTest {

    @Autowired
    private ArtifactService artifactService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldUploadAndDownloadArtifact() {
        String suffix = String.valueOf(System.nanoTime());
        User uploader = userRepository.save(
                User.create(
                        "Artifact Uploader",
                        "artifact-uploader-" + suffix + "@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );

        Project project = projectRepository.save(
                Project.create(
                        "Artifact Test Project",
                        "Artifact 테스트용 프로젝트",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        null,
                        null,
                        50,
                        uploader
                )
        );

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "result.txt",
                "text/plain",
                "artifact-content".getBytes(StandardCharsets.UTF_8)
        );

        AuthenticatedUser uploaderAuth = new AuthenticatedUser(
                uploader.getId(),
                uploader.getEmail(),
                uploader.getRole()
        );

        ArtifactResponse uploaded = artifactService.uploadArtifact(project.getId(), file, uploaderAuth);
        assertNotNull(uploaded.id());
        assertEquals("result.txt", uploaded.originalFileName());

        ArtifactService.ArtifactDownloadResult downloaded = artifactService.downloadArtifact(
                uploaded.id(),
                uploaderAuth
        );
        assertEquals("result.txt", downloaded.originalFileName());
        assertEquals("artifact-content", new String(downloaded.fileData(), StandardCharsets.UTF_8));
    }
}
