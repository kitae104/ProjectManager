package com.projectmanager.backend.settings.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.settings.domain.AdminSetting;
import com.projectmanager.backend.settings.domain.AdminSettingRepository;
import com.projectmanager.backend.settings.domain.UserDisplaySetting;
import com.projectmanager.backend.settings.domain.UserDisplaySettingRepository;
import com.projectmanager.backend.settings.domain.UserNotificationSetting;
import com.projectmanager.backend.settings.domain.UserNotificationSettingRepository;
import com.projectmanager.backend.settings.domain.UserProjectDefaultSetting;
import com.projectmanager.backend.settings.domain.UserProjectDefaultSettingRepository;
import com.projectmanager.backend.settings.dto.AdminSettingResponse;
import com.projectmanager.backend.settings.dto.AdminSettingUpdateRequest;
import com.projectmanager.backend.settings.dto.DisplaySettingResponse;
import com.projectmanager.backend.settings.dto.DisplaySettingUpdateRequest;
import com.projectmanager.backend.settings.dto.NotificationSettingResponse;
import com.projectmanager.backend.settings.dto.NotificationSettingUpdateRequest;
import com.projectmanager.backend.settings.dto.ProjectCreationPolicyResponse;
import com.projectmanager.backend.settings.dto.ProjectDefaultSettingResponse;
import com.projectmanager.backend.settings.dto.ProjectDefaultSettingUpdateRequest;
import com.projectmanager.backend.settings.dto.SettingsPasswordUpdateRequest;
import com.projectmanager.backend.settings.dto.SettingsProfileResponse;
import com.projectmanager.backend.settings.dto.SettingsProfileUpdateRequest;
import com.projectmanager.backend.user.domain.User;
import com.projectmanager.backend.user.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserRepository userRepository;
    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final UserDisplaySettingRepository userDisplaySettingRepository;
    private final UserProjectDefaultSettingRepository userProjectDefaultSettingRepository;
    private final AdminSettingRepository adminSettingRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SettingsProfileResponse getMyProfile(AuthenticatedUser authenticatedUser) {
        return toProfileResponse(findUser(authenticatedUser.userId()));
    }

    @Transactional
    public SettingsProfileResponse updateMyProfile(
            AuthenticatedUser authenticatedUser,
            SettingsProfileUpdateRequest request
    ) {
        User user = findUser(authenticatedUser.userId());
        user.updateProfile(request.name(), request.department(), request.profileImage());
        return toProfileResponse(user);
    }

    @Transactional
    public void updatePassword(
            AuthenticatedUser authenticatedUser,
            SettingsPasswordUpdateRequest request
    ) {
        User user = findUser(authenticatedUser.userId());
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is invalid.");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password.");
        }

        user.updatePassword(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional
    public NotificationSettingResponse getNotificationSettings(AuthenticatedUser authenticatedUser) {
        User user = findUser(authenticatedUser.userId());
        return NotificationSettingResponse.from(getOrCreateNotificationSetting(user));
    }

    @Transactional
    public NotificationSettingResponse updateNotificationSettings(
            AuthenticatedUser authenticatedUser,
            NotificationSettingUpdateRequest request
    ) {
        User user = findUser(authenticatedUser.userId());
        UserNotificationSetting setting = getOrCreateNotificationSetting(user);
        setting.update(
                request.deadlineAlertEnabled(),
                request.blockedTaskAlertEnabled(),
                request.meetingScheduleAlertEnabled()
        );
        return NotificationSettingResponse.from(setting);
    }

    @Transactional
    public DisplaySettingResponse getDisplaySettings(AuthenticatedUser authenticatedUser) {
        User user = findUser(authenticatedUser.userId());
        return DisplaySettingResponse.from(getOrCreateDisplaySetting(user));
    }

    @Transactional
    public DisplaySettingResponse updateDisplaySettings(
            AuthenticatedUser authenticatedUser,
            DisplaySettingUpdateRequest request
    ) {
        User user = findUser(authenticatedUser.userId());
        UserDisplaySetting setting = getOrCreateDisplaySetting(user);
        setting.update(request.theme(), request.sidebarCollapsedDefault());
        return DisplaySettingResponse.from(setting);
    }

    @Transactional
    public ProjectDefaultSettingResponse getProjectDefaultSettings(AuthenticatedUser authenticatedUser) {
        validateProjectDefaultSettingRole(authenticatedUser);
        User user = findUser(authenticatedUser.userId());
        return ProjectDefaultSettingResponse.from(getOrCreateProjectDefaultSetting(user));
    }

    @Transactional
    public ProjectDefaultSettingResponse updateProjectDefaultSettings(
            AuthenticatedUser authenticatedUser,
            ProjectDefaultSettingUpdateRequest request
    ) {
        validateProjectDefaultSettingRole(authenticatedUser);
        User user = findUser(authenticatedUser.userId());
        UserProjectDefaultSetting setting = getOrCreateProjectDefaultSetting(user);
        setting.update(
                request.defaultCategory(),
                request.defaultStatus(),
                request.defaultDescriptionTemplate(),
                request.roleAutoSuggestionEnabled(),
                request.defaultMilestoneTemplate()
        );
        return ProjectDefaultSettingResponse.from(setting);
    }

    @Transactional
    public AdminSettingResponse getAdminSettings() {
        return AdminSettingResponse.from(getOrCreateAdminSetting());
    }

    @Transactional
    public AdminSettingResponse updateAdminSettings(AdminSettingUpdateRequest request) {
        AdminSetting setting = getOrCreateAdminSetting();
        setting.update(
                request.roleChangeApprovalRequired(),
                request.viewerProjectCreationAllowed(),
                request.corsSecurityPolicyNote(),
                request.fileUploadLimitMb(),
                request.defaultSemester(),
                request.projectNamingRule()
        );
        return AdminSettingResponse.from(setting);
    }

    @Transactional(readOnly = true)
    public ProjectCreationPolicyResponse getProjectCreationPolicy() {
        return new ProjectCreationPolicyResponse(isViewerProjectCreationAllowed());
    }

    @Transactional(readOnly = true)
    public boolean isViewerProjectCreationAllowed() {
        return adminSettingRepository.findFirstByOrderByIdAsc()
                .map(AdminSetting::isViewerProjectCreationAllowed)
                .orElse(false);
    }

    private void validateProjectDefaultSettingRole(AuthenticatedUser authenticatedUser) {
        switch (authenticatedUser.role()) {
            case ADMIN:
            case LEADER:
            case MENTOR:
            case PROFESSOR:
                return;
            default:
                throw new AccessDeniedException("Role does not have access to project default settings.");
        }
    }

    private SettingsProfileResponse toProfileResponse(User user) {
        return new SettingsProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getProfileImage()
        );
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    private UserNotificationSetting getOrCreateNotificationSetting(User user) {
        return userNotificationSettingRepository.findByUserId(user.getId())
                .orElseGet(() -> userNotificationSettingRepository.save(
                        UserNotificationSetting.createDefault(user)
                ));
    }

    private UserDisplaySetting getOrCreateDisplaySetting(User user) {
        return userDisplaySettingRepository.findByUserId(user.getId())
                .orElseGet(() -> userDisplaySettingRepository.save(
                        UserDisplaySetting.createDefault(user)
                ));
    }

    private UserProjectDefaultSetting getOrCreateProjectDefaultSetting(User user) {
        return userProjectDefaultSettingRepository.findByUserId(user.getId())
                .orElseGet(() -> userProjectDefaultSettingRepository.save(
                        UserProjectDefaultSetting.createDefault(user)
                ));
    }

    private AdminSetting getOrCreateAdminSetting() {
        return adminSettingRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> adminSettingRepository.save(AdminSetting.createDefault()));
    }
}
