package com.projectmanager.backend.meetingnote.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingNoteRepository extends JpaRepository<MeetingNote, Long> {

    List<MeetingNote> findByProjectIdOrderByMeetingDateTimeDesc(Long projectId);

    void deleteByProjectId(Long projectId);
}

