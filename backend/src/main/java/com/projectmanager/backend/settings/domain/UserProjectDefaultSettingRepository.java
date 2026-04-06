package com.projectmanager.backend.settings.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProjectDefaultSettingRepository extends JpaRepository<UserProjectDefaultSetting, Long> {
    Optional<UserProjectDefaultSetting> findByUserId(Long userId);
}
