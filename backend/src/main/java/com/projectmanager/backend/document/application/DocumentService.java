package com.projectmanager.backend.document.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.document.domain.DocumentRepository;
import com.projectmanager.backend.document.domain.ProjectDocument;
import com.projectmanager.backend.document.dto.DocumentCreateRequest;
import com.projectmanager.backend.document.dto.DocumentResponse;
import com.projectmanager.backend.document.dto.DocumentUpdateRequest;
import com.projectmanager.backend.project.application.ProjectAccessService;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ProjectAccessService projectAccessService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DocumentResponse> getProjectDocuments(Long projectId, AuthenticatedUser authenticatedUser) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanViewProject(authenticatedUser, project);

        return documentRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional
    public DocumentResponse createDocument(
            Long projectId,
            DocumentCreateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanManageProject(authenticatedUser, project);
        User author = findUser(authenticatedUser.userId());

        ProjectDocument document = ProjectDocument.create(
                project,
                request.title(),
                request.type(),
                request.content(),
                request.version(),
                author
        );
        ProjectDocument saved = documentRepository.save(document);
        return DocumentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocument(Long documentId, AuthenticatedUser authenticatedUser) {
        ProjectDocument document = findDocument(documentId);
        projectAccessService.validateCanViewProject(authenticatedUser, document.getProject());
        return DocumentResponse.from(document);
    }

    @Transactional
    public DocumentResponse updateDocument(
            Long documentId,
            DocumentUpdateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        ProjectDocument document = findDocument(documentId);
        projectAccessService.validateCanManageProject(authenticatedUser, document.getProject());
        User author = findUser(authenticatedUser.userId());

        document.update(
                request.title(),
                request.type(),
                request.content(),
                request.version(),
                author
        );
        return DocumentResponse.from(document);
    }

    @Transactional
    public void deleteDocument(Long documentId, AuthenticatedUser authenticatedUser) {
        ProjectDocument document = findDocument(documentId);
        projectAccessService.validateCanManageProject(authenticatedUser, document.getProject());
        documentRepository.delete(document);
    }

    private ProjectDocument findDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
