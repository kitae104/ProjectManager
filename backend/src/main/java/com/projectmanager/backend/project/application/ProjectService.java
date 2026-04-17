package com.projectmanager.backend.project.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.ai.domain.AIInsightRepository;
import com.projectmanager.backend.artifact.domain.ArtifactRepository;
import com.projectmanager.backend.document.domain.DocumentRepository;
import com.projectmanager.backend.meetingnote.domain.MeetingNoteRepository;
import com.projectmanager.backend.milestone.domain.MilestoneRepository;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.project.domain.ProjectMember;
import com.projectmanager.backend.project.domain.ProjectMemberRepository;
import com.projectmanager.backend.project.domain.ProjectMemberRole;
import com.projectmanager.backend.project.domain.ProjectRepository;
import com.projectmanager.backend.project.dto.ProjectCreateRequest;
import com.projectmanager.backend.project.dto.ProjectMemberCreateRequest;
import com.projectmanager.backend.project.dto.ProjectMemberResponse;
import com.projectmanager.backend.project.dto.ProjectResponse;
import com.projectmanager.backend.project.dto.ProjectUpdateRequest;
import com.projectmanager.backend.schedule.domain.ScheduleRepository;
import com.projectmanager.backend.task.domain.TaskRepository;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import com.projectmanager.backend.user.domain.UserRole;
import java.util.LinkedHashSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AIInsightRepository aiInsightRepository;
    private final ArtifactRepository artifactRepository;
    private final DocumentRepository documentRepository;
    private final MeetingNoteRepository meetingNoteRepository;
    private final MilestoneRepository milestoneRepository;
    private final ScheduleRepository scheduleRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, AuthenticatedUser authenticatedUser) {
        validateCanCreateProject(authenticatedUser);

        User leader = findLeader(request.leaderId());

        Project project = Project.create(
                request.title(),
                request.description(),
                request.category(),
                request.status(),
                request.semester(),
                request.startDate(),
                request.endDate(),
                request.progress(),
                leader
        );

        Project savedProject = projectRepository.save(project);

        if (leader != null && !projectMemberRepository.existsByProjectIdAndUserId(savedProject.getId(), leader.getId())) {
            ProjectMember leaderMember = ProjectMember.create(
                    savedProject,
                    leader,
                    ProjectMemberRole.LEADER,
                    "Project leader"
            );
            projectMemberRepository.save(leaderMember);
        }

        return ProjectResponse.from(savedProject);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(AuthenticatedUser authenticatedUser) {
        List<Project> projects = switch (authenticatedUser.role()) {
            case ADMIN -> projectRepository.findAllByOrderByUpdatedAtDesc();
            case LEADER -> projectRepository.findByLeaderIdOrderByUpdatedAtDesc(authenticatedUser.userId());
            case MEMBER -> getMemberProjects(authenticatedUser.userId());
        };

        return projects
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId, AuthenticatedUser authenticatedUser) {
        Project project = findProject(projectId);
        validateCanViewProject(authenticatedUser, project);
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse updateProject(
            Long projectId,
            ProjectUpdateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = findProject(projectId);
        validateCanManageProjectInfo(authenticatedUser, project);
        User leader = resolveProjectLeaderForUpdate(project, request.leaderId(), authenticatedUser);

        project.update(
                request.title(),
                request.description(),
                request.category(),
                request.status(),
                request.semester(),
                request.startDate(),
                request.endDate(),
                request.progress(),
                leader
        );
        synchronizeLeaderMember(project, leader);
        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(Long projectId, AuthenticatedUser authenticatedUser) {
        Project project = findProject(projectId);
        validateCanManageProjectInfo(authenticatedUser, project);

        aiInsightRepository.deleteByProjectId(projectId);
        artifactRepository.deleteByProjectId(projectId);
        documentRepository.deleteByProjectId(projectId);
        meetingNoteRepository.deleteByProjectId(projectId);
        milestoneRepository.deleteByProjectId(projectId);
        scheduleRepository.deleteByProjectId(projectId);
        taskRepository.deleteByProjectId(projectId);
        projectMemberRepository.deleteByProjectId(projectId);
        projectRepository.deleteById(projectId);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getProjectMembers(Long projectId, AuthenticatedUser authenticatedUser) {
        Project project = findProject(projectId);
        validateCanViewProject(authenticatedUser, project);

        return projectMemberRepository.findByProjectId(projectId)
                .stream()
                .map(ProjectMemberResponse::from)
                .toList();
    }

    @Transactional
    public ProjectMemberResponse addProjectMember(
            Long projectId,
            ProjectMemberCreateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = findProject(projectId);
        validateCanManageProjectMembers(authenticatedUser, project);

        if (request.projectRole() == ProjectMemberRole.LEADER) {
            throw new IllegalArgumentException("프로젝트 팀장은 관리자만 지정할 수 있습니다.");
        }

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new IllegalArgumentException("이미 프로젝트에 참여한 사용자입니다.");
        }

        ProjectMember projectMember = ProjectMember.create(
                project,
                user,
                request.projectRole(),
                request.responsibility()
        );
        ProjectMember savedMember = projectMemberRepository.save(projectMember);
        return ProjectMemberResponse.from(savedMember);
    }

    @Transactional
    public void removeProjectMember(Long projectId, Long memberId, AuthenticatedUser authenticatedUser) {
        Project project = findProject(projectId);
        validateCanManageProjectMembers(authenticatedUser, project);

        ProjectMember member = projectMemberRepository.findByIdAndProjectId(memberId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트 팀원을 찾을 수 없습니다."));

        if (project.getLeader() != null && project.getLeader().getId().equals(member.getUser().getId())) {
            throw new IllegalArgumentException("프로젝트 팀장은 제거할 수 없습니다.");
        }

        projectMemberRepository.delete(member);
    }

    private List<Project> getMemberProjects(Long userId) {
        LinkedHashSet<Long> projectIds = projectMemberRepository.findByUserId(userId)
                .stream()
                .map(projectMember -> projectMember.getProject().getId())
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));

        if (projectIds.isEmpty()) {
            return List.of();
        }

        return projectRepository.findByIdInOrderByUpdatedAtDesc(projectIds.stream().toList());
    }

    private void validateCanCreateProject(AuthenticatedUser authenticatedUser) {
        if (!isAdminUser(authenticatedUser)) {
            throw forbidden("관리자만 프로젝트를 생성할 수 있습니다.");
        }
    }

    private void validateCanViewProject(AuthenticatedUser authenticatedUser, Project project) {
        if (isAdminUser(authenticatedUser)) {
            return;
        }

        if (isProjectLeader(authenticatedUser, project)) {
            return;
        }

        if (authenticatedUser.role() == UserRole.MEMBER
                && projectMemberRepository.existsByProjectIdAndUserId(project.getId(), authenticatedUser.userId())) {
            return;
        }

        throw forbidden("해당 프로젝트를 조회할 권한이 없습니다.");
    }

    private void validateCanManageProjectInfo(AuthenticatedUser authenticatedUser, Project project) {
        if (isAdminUser(authenticatedUser)) {
            return;
        }

        validateProjectLeaderOnly(authenticatedUser, project);
    }

    private void validateCanManageProjectMembers(AuthenticatedUser authenticatedUser, Project project) {
        validateProjectLeaderOnly(authenticatedUser, project);
    }

    private void validateProjectLeaderOnly(AuthenticatedUser authenticatedUser, Project project) {
        if (!isProjectLeader(authenticatedUser, project)) {
            throw forbidden("본인이 팀장인 프로젝트만 관리할 수 있습니다.");
        }
    }

    private boolean isProjectLeader(AuthenticatedUser authenticatedUser, Project project) {
        return project.getLeader() != null
                && project.getLeader().getId().equals(authenticatedUser.userId());
    }

    private boolean isAdminUser(AuthenticatedUser authenticatedUser) {
        return userRepository.findById(authenticatedUser.userId())
                .map(user -> user.getRole() == UserRole.ADMIN)
                .orElse(false);
    }

    private User resolveProjectLeaderForUpdate(
            Project project,
            Long requestedLeaderId,
            AuthenticatedUser authenticatedUser
    ) {
        if (isAdminUser(authenticatedUser)) {
            Long targetLeaderId = requestedLeaderId;
            if (targetLeaderId == null && project.getLeader() != null) {
                targetLeaderId = project.getLeader().getId();
            }
            return findLeader(targetLeaderId);
        }

        if (requestedLeaderId != null
                && project.getLeader() != null
                && !requestedLeaderId.equals(project.getLeader().getId())) {
            throw forbidden("프로젝트 팀장 변경은 관리자만 가능합니다.");
        }

        if (project.getLeader() == null) {
            throw new IllegalArgumentException("프로젝트 팀장이 설정되어 있지 않습니다.");
        }
        return project.getLeader();
    }

    private void synchronizeLeaderMember(Project project, User leader) {
        List<ProjectMember> members = projectMemberRepository.findByProjectId(project.getId());
        ProjectMember leaderMember = null;

        for (ProjectMember member : members) {
            boolean isTargetLeader = member.getUser().getId().equals(leader.getId());

            if (isTargetLeader) {
                leaderMember = member;
            }

            if (member.getProjectRole() == ProjectMemberRole.LEADER && !isTargetLeader) {
                projectMemberRepository.delete(member);
            }
        }

        if (leaderMember == null) {
            projectMemberRepository.save(ProjectMember.create(project, leader, ProjectMemberRole.LEADER, "Project leader"));
            return;
        }

        leaderMember.updateRole(ProjectMemberRole.LEADER);
        if (leaderMember.getResponsibility() == null || leaderMember.getResponsibility().isBlank()) {
            leaderMember.updateResponsibility("Project leader");
        }
    }

    private Project findProject(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));
    }

    private User findLeader(Long leaderId) {
        if (leaderId == null) {
            throw new IllegalArgumentException("프로젝트 팀장(leaderId)은 필수입니다.");
        }

        User leader = userRepository.findById(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("팀장 사용자를 찾을 수 없습니다."));

        if (leader.getRole() != UserRole.LEADER) {
            throw new IllegalArgumentException("프로젝트 팀장은 LEADER 역할 사용자만 지정할 수 있습니다.");
        }

        return leader;
    }

    private AccessDeniedException forbidden(String message) {
        return new AccessDeniedException(message);
    }
}
