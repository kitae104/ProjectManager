package com.projectmanager.backend.project.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByOrderByUpdatedAtDesc();

    List<Project> findByLeaderIdOrderByUpdatedAtDesc(Long leaderId);

    List<Project> findByIdInOrderByUpdatedAtDesc(List<Long> ids);
}
