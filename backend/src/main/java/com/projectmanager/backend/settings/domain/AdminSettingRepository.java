package com.projectmanager.backend.settings.domain;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSettingRepository extends JpaRepository<AdminSetting, Long> {
    Optional<AdminSetting> findFirstByOrderByIdAsc();
}
