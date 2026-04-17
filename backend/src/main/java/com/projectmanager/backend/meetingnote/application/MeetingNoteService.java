package com.projectmanager.backend.meetingnote.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.meetingnote.domain.MeetingNote;
import com.projectmanager.backend.meetingnote.domain.MeetingNoteRepository;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteCreateRequest;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteResponse;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteUpdateRequest;
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
public class MeetingNoteService {

    private final MeetingNoteRepository meetingNoteRepository;
    private final ProjectAccessService projectAccessService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MeetingNoteResponse> getProjectMeetingNotes(
            Long projectId,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanViewProject(authenticatedUser, project);

        return meetingNoteRepository.findByProjectIdOrderByMeetingDateTimeDesc(projectId)
                .stream()
                .map(MeetingNoteResponse::from)
                .toList();
    }

    @Transactional
    public MeetingNoteResponse createMeetingNote(
            Long projectId,
            MeetingNoteCreateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanManageProject(authenticatedUser, project);
        User author = findUser(authenticatedUser.userId());

        MeetingNote note = MeetingNote.create(
                project,
                request.title(),
                request.meetingDateTime(),
                request.attendees(),
                request.content(),
                request.summary(),
                author
        );
        MeetingNote saved = meetingNoteRepository.save(note);
        return MeetingNoteResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public MeetingNoteResponse getMeetingNote(Long meetingNoteId, AuthenticatedUser authenticatedUser) {
        MeetingNote note = findMeetingNote(meetingNoteId);
        projectAccessService.validateCanViewProject(authenticatedUser, note.getProject());
        return MeetingNoteResponse.from(note);
    }

    @Transactional
    public MeetingNoteResponse updateMeetingNote(
            Long meetingNoteId,
            MeetingNoteUpdateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        MeetingNote note = findMeetingNote(meetingNoteId);
        projectAccessService.validateCanManageProject(authenticatedUser, note.getProject());
        User author = findUser(authenticatedUser.userId());

        note.update(
                request.title(),
                request.meetingDateTime(),
                request.attendees(),
                request.content(),
                request.summary(),
                author
        );
        return MeetingNoteResponse.from(note);
    }

    @Transactional
    public void deleteMeetingNote(Long meetingNoteId, AuthenticatedUser authenticatedUser) {
        MeetingNote note = findMeetingNote(meetingNoteId);
        projectAccessService.validateCanManageProject(authenticatedUser, note.getProject());
        meetingNoteRepository.delete(note);
    }

    private MeetingNote findMeetingNote(Long meetingNoteId) {
        return meetingNoteRepository.findById(meetingNoteId)
                .orElseThrow(() -> new IllegalArgumentException("회의록을 찾을 수 없습니다."));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
