package com.projectmanager.backend.meetingnote.domain;

import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Entity
@Table(name = "meeting_notes")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MeetingNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "meeting_datetime", nullable = false)
    private LocalDateTime meetingDateTime;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String attendees;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private MeetingNote(
            Project project,
            String title,
            LocalDateTime meetingDateTime,
            String attendees,
            String content,
            String summary,
            User author
    ) {
        this.project = project;
        this.title = title;
        this.meetingDateTime = meetingDateTime;
        this.attendees = attendees;
        this.content = content;
        this.summary = summary;
        this.author = author;
    }

    public static MeetingNote create(
            Project project,
            String title,
            LocalDateTime meetingDateTime,
            String attendees,
            String content,
            String summary,
            User author
    ) {
        return new MeetingNote(project, title, meetingDateTime, attendees, content, summary, author);
    }

    public void update(
            String title,
            LocalDateTime meetingDateTime,
            String attendees,
            String content,
            String summary,
            User author
    ) {
        this.title = title;
        this.meetingDateTime = meetingDateTime;
        this.attendees = attendees;
        this.content = content;
        this.summary = summary;
        this.author = author;
    }
}

