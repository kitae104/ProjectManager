package com.projectmanager.backend.meetingnote.application;

import com.projectmanager.backend.meetingnote.domain.MeetingNote;
import com.projectmanager.backend.meetingnote.domain.MeetingNoteRepository;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteCreateRequest;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteResponse;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteUpdateRequest;
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
public class MeetingNoteService {

    private final MeetingNoteRepository meetingNoteRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MeetingNoteResponse> getProjectMeetingNotes(Long projectId) {
        ensureProjectExists(projectId);
        return meetingNoteRepository.findByProjectIdOrderByMeetingDateTimeDesc(projectId)
                .stream()
                .map(MeetingNoteResponse::from)
                .toList();
    }

    @Transactional
    public MeetingNoteResponse createMeetingNote(Long projectId, MeetingNoteCreateRequest request, Long userId) {
        Project project = findProject(projectId);
        User author = findUser(userId);

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
    public MeetingNoteResponse getMeetingNote(Long meetingNoteId) {
        return MeetingNoteResponse.from(findMeetingNote(meetingNoteId));
    }

    @Transactional
    public MeetingNoteResponse updateMeetingNote(Long meetingNoteId, MeetingNoteUpdateRequest request, Long userId) {
        MeetingNote note = findMeetingNote(meetingNoteId);
        User author = findUser(userId);

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
    public void deleteMeetingNote(Long meetingNoteId) {
        if (!meetingNoteRepository.existsById(meetingNoteId)) {
            throw new IllegalArgumentException("회의록을 찾을 수 없습니다.");
        }
        meetingNoteRepository.deleteById(meetingNoteId);
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

    private MeetingNote findMeetingNote(Long meetingNoteId) {
        return meetingNoteRepository.findById(meetingNoteId)
                .orElseThrow(() -> new IllegalArgumentException("회의록을 찾을 수 없습니다."));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}

