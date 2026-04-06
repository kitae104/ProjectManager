package com.projectmanager.backend.settings.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDisplaySettingRepository extends JpaRepository<UserDisplaySetting, Long> {
    Optional<UserDisplaySetting> findByUserId(Long userId);
}
