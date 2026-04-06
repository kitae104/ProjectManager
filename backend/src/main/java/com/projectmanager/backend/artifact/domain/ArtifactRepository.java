package com.projectmanager.backend.artifact.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtifactRepository extends JpaRepository<Artifact, Long> {

    List<Artifact> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    void deleteByProjectId(Long projectId);
}

