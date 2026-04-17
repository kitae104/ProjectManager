package com.projectmanager.backend.meetingnote.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteCreateRequest;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteResponse;
import com.projectmanager.backend.meetingnote.dto.MeetingNoteUpdateRequest;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectCategory;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.domain.ProjectStatus;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class MeetingNoteServiceTest {

    @Autowired
    private MeetingNoteService meetingNoteService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateAndUpdateMeetingNote() {
        String suffix = String.valueOf(System.nanoTime());
        User author = userRepository.save(
                User.create(
                        "Meeting Author",
                        "meeting-author-" + suffix + "@example.com",
                        passwordEncoder.encode("password1234"),
                        UserRole.LEADER,
                        "CS"
                )
        );

        Project project = projectRepository.save(
                Project.create(
                        "Meeting Test Project",
                        "MeetingNote 테스트용 프로젝트",
                        ProjectCategory.DEVELOPMENT,
                        ProjectStatus.IN_PROGRESS,
                        "2026-1",
                        null,
                        null,
                        40,
                        author
                )
        );

        AuthenticatedUser authorAuth = new AuthenticatedUser(
                author.getId(),
                author.getEmail(),
                author.getRole()
        );

        MeetingNoteResponse created = meetingNoteService.createMeetingNote(
                project.getId(),
                new MeetingNoteCreateRequest(
                        "주간 회의",
                        LocalDateTime.of(2026, 5, 7, 14, 0),
                        "홍길동, 김코덱스",
                        "진행 상황 공유 및 이슈 점검",
                        "이번 주 핵심 이슈 2건 정리"
                ),
                authorAuth
        );

        assertNotNull(created.id());
        assertEquals("주간 회의", created.title());

        MeetingNoteResponse updated = meetingNoteService.updateMeetingNote(
                created.id(),
                new MeetingNoteUpdateRequest(
                        "주간 회의(수정)",
                        LocalDateTime.of(2026, 5, 8, 10, 0),
                        "홍길동, 김코덱스, 박플랜",
                        "일정 조정 및 우선순위 재정의",
                        "다음 주 액션 아이템 확정"
                ),
                authorAuth
        );

        assertEquals("주간 회의(수정)", updated.title());
        assertEquals(LocalDateTime.of(2026, 5, 8, 10, 0), updated.meetingDateTime());
    }
}
