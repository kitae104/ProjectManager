package com.projectmanager.backend.milestone.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.milestone.domain.Milestone;
import com.projectmanager.backend.milestone.domain.MilestoneRepository;
import com.projectmanager.backend.milestone.dto.MilestoneCreateRequest;
import com.projectmanager.backend.milestone.dto.MilestoneResponse;
import com.projectmanager.backend.milestone.dto.MilestoneUpdateRequest;
import com.projectmanager.backend.project.application.ProjectAccessService;
import com.projectmanager.backend.project.domain.Project;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectAccessService projectAccessService;

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getProjectMilestones(
            Long projectId,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanViewProject(authenticatedUser, project);

        return milestoneRepository.findByProjectIdOrderByDueDateAscCreatedAtAsc(projectId)
                .stream()
                .map(MilestoneResponse::from)
                .toList();
    }

    @Transactional
    public MilestoneResponse createMilestone(
            Long projectId,
            MilestoneCreateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanManageProject(authenticatedUser, project);

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
    public MilestoneResponse updateMilestone(
            Long milestoneId,
            MilestoneUpdateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Milestone milestone = findMilestone(milestoneId);
        projectAccessService.validateCanManageProject(authenticatedUser, milestone.getProject());

        milestone.update(
                request.title(),
                request.description(),
                request.dueDate(),
                request.status()
        );
        return MilestoneResponse.from(milestone);
    }

    @Transactional
    public void deleteMilestone(Long milestoneId, AuthenticatedUser authenticatedUser) {
        Milestone milestone = findMilestone(milestoneId);
        projectAccessService.validateCanManageProject(authenticatedUser, milestone.getProject());
        milestoneRepository.delete(milestone);
    }

    private Milestone findMilestone(Long milestoneId) {
        return milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("마일스톤을 찾을 수 없습니다."));
    }
}
