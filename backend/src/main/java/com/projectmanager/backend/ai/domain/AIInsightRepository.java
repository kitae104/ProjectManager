package com.projectmanager.backend.ai.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AIInsightRepository extends JpaRepository<AIInsight, Long> {

    List<AIInsight> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    void deleteByProjectId(Long projectId);
}

