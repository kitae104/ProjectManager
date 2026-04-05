package com.projectmanager.backend.project.dto;

import com.projectmanager.backend.project.domain.ProjectMember;
import com.projectmanager.backend.project.domain.ProjectMemberRole;
import java.time.Instant;

public record ProjectMemberResponse(
        Long id,
        Long userId,
        String name,
        String email,
        ProjectMemberRole projectRole,
        String responsibility,
        Instant joinedAt
) {
    public static ProjectMemberResponse from(ProjectMember member) {
        return new ProjectMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getName(),
                member.getUser().getEmail(),
                member.getProjectRole(),
                member.getResponsibility(),
                member.getJoinedAt()
        );
    }
}

