package com.projectmanager.backend.settings.dto;

import com.projectmanager.backend.settings.domain.AdminSetting;

public record AdminSettingResponse(
        boolean roleChangeApprovalRequired,
        boolean viewerProjectCreationAllowed,
        String corsSecurityPolicyNote,
        Integer fileUploadLimitMb,
        String defaultSemester,
        String projectNamingRule
) {
    public static AdminSettingResponse from(AdminSetting setting) {
        return new AdminSettingResponse(
                setting.isRoleChangeApprovalRequired(),
                setting.isViewerProjectCreationAllowed(),
                setting.getCorsSecurityPolicyNote(),
                setting.getFileUploadLimitMb(),
                setting.getDefaultSemester(),
                setting.getProjectNamingRule()
        );
    }
}
