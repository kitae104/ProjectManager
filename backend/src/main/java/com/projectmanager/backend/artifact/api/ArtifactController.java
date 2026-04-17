package com.projectmanager.backend.artifact.api;

import com.projectmanager.backend.artifact.application.ArtifactService;
import com.projectmanager.backend.artifact.application.ArtifactService.ArtifactDownloadResult;
import com.projectmanager.backend.artifact.dto.ArtifactResponse;
import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
public class ArtifactController {

    private final ArtifactService artifactService;

    @GetMapping("/api/projects/{id}/artifacts")
    public ResponseEntity<ApiResponse<List<ArtifactResponse>>> getProjectArtifacts(
            @PathVariable("id") Long projectId,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        List<ArtifactResponse> response = artifactService.getProjectArtifacts(projectId, user);
        return ResponseEntity.ok(ApiResponse.success("산출물 목록을 조회했습니다.", response));
    }

    @PostMapping(value = "/api/projects/{id}/artifacts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ArtifactResponse>> uploadArtifact(
            @PathVariable("id") Long projectId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        ArtifactResponse response = artifactService.uploadArtifact(projectId, file, user);
        return ResponseEntity.ok(ApiResponse.success("산출물을 업로드했습니다.", response));
    }

    @GetMapping("/api/artifacts/{artifactId}/download")
    public ResponseEntity<Resource> downloadArtifact(
            @PathVariable("artifactId") Long artifactId,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        ArtifactDownloadResult result = artifactService.downloadArtifact(artifactId, user);
        ByteArrayResource resource = new ByteArrayResource(result.fileData());
        String contentType = result.contentType() == null || result.contentType().isBlank()
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : result.contentType();

        String encodedFileName = java.net.URLEncoder.encode(result.originalFileName(), StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(resource);
    }

    @DeleteMapping("/api/artifacts/{artifactId}")
    public ResponseEntity<ApiResponse<Void>> deleteArtifact(
            @PathVariable("artifactId") Long artifactId,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        artifactService.deleteArtifact(artifactId, user);
        return ResponseEntity.ok(ApiResponse.success("산출물을 삭제했습니다."));
    }
}
