package com.projectmanager.backend.document.api;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.document.application.DocumentService;
import com.projectmanager.backend.document.dto.DocumentCreateRequest;
import com.projectmanager.backend.document.dto.DocumentResponse;
import com.projectmanager.backend.document.dto.DocumentUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/api/projects/{id}/documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getProjectDocuments(
            @PathVariable("id") Long projectId
    ) {
        List<DocumentResponse> response = documentService.getProjectDocuments(projectId);
        return ResponseEntity.ok(ApiResponse.success("문서 목록을 조회했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/documents")
    public ResponseEntity<ApiResponse<DocumentResponse>> createDocument(
            @PathVariable("id") Long projectId,
            @Valid @RequestBody DocumentCreateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        DocumentResponse response = documentService.createDocument(projectId, request, user.userId());
        return ResponseEntity.ok(ApiResponse.success("문서를 생성했습니다.", response));
    }

    @GetMapping("/api/documents/{documentId}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(
            @PathVariable("documentId") Long documentId
    ) {
        DocumentResponse response = documentService.getDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success("문서 상세를 조회했습니다.", response));
    }

    @PutMapping("/api/documents/{documentId}")
    public ResponseEntity<ApiResponse<DocumentResponse>> updateDocument(
            @PathVariable("documentId") Long documentId,
            @Valid @RequestBody DocumentUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        DocumentResponse response = documentService.updateDocument(documentId, request, user.userId());
        return ResponseEntity.ok(ApiResponse.success("문서를 수정했습니다.", response));
    }

    @DeleteMapping("/api/documents/{documentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable("documentId") Long documentId
    ) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success("문서를 삭제했습니다."));
    }
}

