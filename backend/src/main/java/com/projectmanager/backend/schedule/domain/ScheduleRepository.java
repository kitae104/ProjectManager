package com.projectmanager.backend.schedule.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByProjectIdOrderByStartDateTimeAsc(Long projectId);

    void deleteByProjectId(Long projectId);
}

