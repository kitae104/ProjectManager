package com.projectmanager.backend.document.application;

import com.projectmanager.backend.document.domain.DocumentRepository;
import com.projectmanager.backend.document.domain.ProjectDocument;
import com.projectmanager.backend.document.dto.DocumentCreateRequest;
import com.projectmanager.backend.document.dto.DocumentResponse;
import com.projectmanager.backend.document.dto.DocumentUpdateRequest;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectRepository;
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
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DocumentResponse> getProjectDocuments(Long projectId) {
        ensureProjectExists(projectId);
        return documentRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                .stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional
    public DocumentResponse createDocument(Long projectId, DocumentCreateRequest request, Long userId) {
        Project project = findProject(projectId);
        User author = findUser(userId);
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
    public DocumentResponse getDocument(Long documentId) {
        return DocumentResponse.from(findDocument(documentId));
    }

    @Transactional
    public DocumentResponse updateDocument(Long documentId, DocumentUpdateRequest request, Long userId) {
        ProjectDocument document = findDocument(documentId);
        User author = findUser(userId);
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
    public void deleteDocument(Long documentId) {
        if (!documentRepository.existsById(documentId)) {
            throw new IllegalArgumentException("문서를 찾을 수 없습니다.");
        }
        documentRepository.deleteById(documentId);
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

    private ProjectDocument findDocument(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}

