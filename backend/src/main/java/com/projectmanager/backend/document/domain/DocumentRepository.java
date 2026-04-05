package com.projectmanager.backend.document.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<ProjectDocument, Long> {

    List<ProjectDocument> findByProjectIdOrderByUpdatedAtDesc(Long projectId);

    void deleteByProjectId(Long projectId);
}

