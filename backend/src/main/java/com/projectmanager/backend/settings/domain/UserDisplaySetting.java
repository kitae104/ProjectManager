package com.projectmanager.backend.settings.domain;

import com.projectmanager.backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "user_display_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserDisplaySetting {

    public enum Theme {
        LIGHT,
        DARK
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "theme", nullable = false, length = 20)
    private Theme theme;

    @Column(name = "sidebar_collapsed_default", nullable = false)
    private boolean sidebarCollapsedDefault;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private UserDisplaySetting(
            User user,
            Theme theme,
            boolean sidebarCollapsedDefault
    ) {
        this.user = user;
        this.theme = theme;
        this.sidebarCollapsedDefault = sidebarCollapsedDefault;
    }

    public static UserDisplaySetting createDefault(User user) {
        return new UserDisplaySetting(user, Theme.LIGHT, false);
    }

    public void update(Theme theme, boolean sidebarCollapsedDefault) {
        this.theme = theme;
        this.sidebarCollapsedDefault = sidebarCollapsedDefault;
    }
}

