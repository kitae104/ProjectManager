package com.projectmanager.backend.milestone.application;

import com.projectmanager.backend.milestone.domain.Milestone;
import com.projectmanager.backend.milestone.domain.MilestoneRepository;
import com.projectmanager.backend.milestone.dto.MilestoneCreateRequest;
import com.projectmanager.backend.milestone.dto.MilestoneResponse;
import com.projectmanager.backend.milestone.dto.MilestoneUpdateRequest;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getProjectMilestones(Long projectId) {
        ensureProjectExists(projectId);
        return milestoneRepository.findByProjectIdOrderByDueDateAscCreatedAtAsc(projectId)
                .stream()
                .map(MilestoneResponse::from)
                .toList();
    }

    @Transactional
    public MilestoneResponse createMilestone(Long projectId, MilestoneCreateRequest request) {
        Project project = findProject(projectId);
        Milestone milestone = Milestone.create(
                project,
                request.title(),
                request.description(),
                request.dueDate(),
                request.status()
        );
        Milestone savedMilestone = milestoneRepository.save(milestone);
        return MilestoneResponse.from(savedMilestone);
    }

    @Transactional
    public MilestoneResponse updateMilestone(Long milestoneId, MilestoneUpdateRequest request) {
        Milestone milestone = findMilestone(milestoneId);
        milestone.update(
                request.title(),
                request.description(),
                request.dueDate(),
                request.status()
        );
        return MilestoneResponse.from(milestone);
    }

    @Transactional
    public void deleteMilestone(Long milestoneId) {
        if (!milestoneRepository.existsById(milestoneId)) {
            throw new IllegalArgumentException("마일스톤을 찾을 수 없습니다.");
        }
        milestoneRepository.deleteById(milestoneId);
    }

    private void ensureProjectExists(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다.");
        }
    }

    private Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
    }

    private Milestone findMilestone(Long milestoneId) {
        return milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("마일스톤을 찾을 수 없습니다."));
    }
}

