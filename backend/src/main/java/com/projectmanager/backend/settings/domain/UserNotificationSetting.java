package com.projectmanager.backend.settings.domain;

import com.projectmanager.backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Entity
@Table(name = "user_notification_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserNotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "deadline_alert_enabled", nullable = false)
    private boolean deadlineAlertEnabled;

    @Column(name = "blocked_task_alert_enabled", nullable = false)
    private boolean blockedTaskAlertEnabled;

    @Column(name = "meeting_schedule_alert_enabled", nullable = false)
    private boolean meetingScheduleAlertEnabled;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private UserNotificationSetting(
            User user,
            boolean deadlineAlertEnabled,
            boolean blockedTaskAlertEnabled,
            boolean meetingScheduleAlertEnabled
    ) {
        this.user = user;
        this.deadlineAlertEnabled = deadlineAlertEnabled;
        this.blockedTaskAlertEnabled = blockedTaskAlertEnabled;
        this.meetingScheduleAlertEnabled = meetingScheduleAlertEnabled;
    }

    public static UserNotificationSetting createDefault(User user) {
        return new UserNotificationSetting(user, true, true, true);
    }

    public void update(
            boolean deadlineAlertEnabled,
            boolean blockedTaskAlertEnabled,
            boolean meetingScheduleAlertEnabled
    ) {
        this.deadlineAlertEnabled = deadlineAlertEnabled;
        this.blockedTaskAlertEnabled = blockedTaskAlertEnabled;
        this.meetingScheduleAlertEnabled = meetingScheduleAlertEnabled;
    }
}

