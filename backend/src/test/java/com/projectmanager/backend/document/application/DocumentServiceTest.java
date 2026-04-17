package com.projectmanager.backend.document.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.document.domain.DocumentType;
import com.projectmanager.backend.document.dto.DocumentCreateRequest;
import com.projectmanager.backend.document.dto.DocumentResponse;
import com.projectmanager.backend.document.dto.DocumentUpdateRequest;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class DocumentServiceTest {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateAndUpdateDocument() {
        String suffix = String.valueOf(System.nanoTime());
        User author = userRepository.save(
                User.create(
                        "Document Author",
                        "document-author-" + suffix + "@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );

        Project project = projectRepository.save(
                Project.create(
                        "Document Test Project",
                        "Document 테스트용 프로젝트",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        null,
                        null,
                        30,
                        author
                )
        );

        AuthenticatedUser authorAuth = new AuthenticatedUser(
                author.getId(),
                author.getEmail(),
                author.getRole()
        );

        DocumentResponse created = documentService.createDocument(
                project.getId(),
                new DocumentCreateRequest(
                        "프로젝트 개요서",
                        DocumentType.PROJECT_OVERVIEW,
                        "초기 개요 내용",
                        "v1.0"
                ),
                authorAuth
        );

        assertNotNull(created.id());
        assertEquals(DocumentType.PROJECT_OVERVIEW, created.type());
        assertEquals("v1.0", created.version());

        DocumentResponse updated = documentService.updateDocument(
                created.id(),
                new DocumentUpdateRequest(
                        "프로젝트 개요서",
                        DocumentType.TECHNICAL_DOC,
                        "기술 문서 형태로 내용 업데이트",
                        "v1.1"
                ),
                authorAuth
        );

        assertEquals(DocumentType.TECHNICAL_DOC, updated.type());
        assertEquals("v1.1", updated.version());
    }
}
