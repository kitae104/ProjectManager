package com.projectmanager.backend.meetingnote.api;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.meetingnote.application.MeetingNoteService;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteCreateRequest;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteResponse;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteUpdateRequest;
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
public class MeetingNoteController {

    private final MeetingNoteService meetingNoteService;

    @GetMapping("/api/projects/{id}/meeting-notes")
    public ResponseEntity<ApiResponse<List<MeetingNoteResponse>>> getProjectMeetingNotes(
            @PathVariable("id") Long projectId
    ) {
        List<MeetingNoteResponse> response = meetingNoteService.getProjectMeetingNotes(projectId);
        return ResponseEntity.ok(ApiResponse.success("회의록 목록을 조회했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/meeting-notes")
    public ResponseEntity<ApiResponse<MeetingNoteResponse>> createMeetingNote(
            @PathVariable("id") Long projectId,
            @Valid @RequestBody MeetingNoteCreateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        MeetingNoteResponse response = meetingNoteService.createMeetingNote(projectId, request, user.userId());
        return ResponseEntity.ok(ApiResponse.success("회의록을 생성했습니다.", response));
    }

    @GetMapping("/api/meeting-notes/{id}")
    public ResponseEntity<ApiResponse<MeetingNoteResponse>> getMeetingNote(
            @PathVariable("id") Long meetingNoteId
    ) {
        MeetingNoteResponse response = meetingNoteService.getMeetingNote(meetingNoteId);
        return ResponseEntity.ok(ApiResponse.success("회의록 상세를 조회했습니다.", response));
    }

    @PutMapping("/api/meeting-notes/{id}")
    public ResponseEntity<ApiResponse<MeetingNoteResponse>> updateMeetingNote(
            @PathVariable("id") Long meetingNoteId,
            @Valid @RequestBody MeetingNoteUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        MeetingNoteResponse response = meetingNoteService.updateMeetingNote(meetingNoteId, request, user.userId());
        return ResponseEntity.ok(ApiResponse.success("회의록을 수정했습니다.", response));
    }

    @DeleteMapping("/api/meeting-notes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMeetingNote(
            @PathVariable("id") Long meetingNoteId
    ) {
        meetingNoteService.deleteMeetingNote(meetingNoteId);
        return ResponseEntity.ok(ApiResponse.success("회의록을 삭제했습니다."));
    }
}

