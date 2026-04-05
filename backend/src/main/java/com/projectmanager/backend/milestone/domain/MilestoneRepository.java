package com.projectmanager.backend.milestone.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProjectIdOrderByDueDateAscCreatedAtAsc(Long projectId);

    void deleteByProjectId(Long projectId);
}

