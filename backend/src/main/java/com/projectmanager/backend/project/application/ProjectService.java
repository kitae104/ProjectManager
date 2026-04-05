package com.projectmanager.backend.project.application;

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
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
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
                    "프로젝트 리더"
            );
            projectMemberRepository.save(leaderMember);
        }

        return ProjectResponse.from(savedProject);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        return projectRepository.findAll()
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        return ProjectResponse.from(findProject(projectId));
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectUpdateRequest request) {
        Project project = findProject(projectId);
        User leader = findLeader(request.leaderId());

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
        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다.");
        }
        projectMemberRepository.deleteByProjectId(projectId);
        projectRepository.deleteById(projectId);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
        ensureProjectExists(projectId);
        return projectMemberRepository.findByProjectId(projectId)
                .stream()
                .map(ProjectMemberResponse::from)
                .toList();
    }

    @Transactional
    public ProjectMemberResponse addProjectMember(Long projectId, ProjectMemberCreateRequest request) {
        Project project = findProject(projectId);
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            throw new IllegalArgumentException("이미 프로젝트에 참여 중인 사용자입니다.");
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
    public void removeProjectMember(Long projectId, Long memberId) {
        ProjectMember member = projectMemberRepository.findByIdAndProjectId(memberId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트 멤버를 찾을 수 없습니다."));
        projectMemberRepository.delete(member);
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

    private User findLeader(Long leaderId) {
        if (leaderId == null) {
            return null;
        }
        return userRepository.findById(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("리더 사용자를 찾을 수 없습니다."));
    }
}
