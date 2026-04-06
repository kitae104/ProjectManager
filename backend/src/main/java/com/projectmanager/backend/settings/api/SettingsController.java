package com.projectmanager.backend.settings.api;

import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.settings.application.SettingsService;
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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SettingsProfileResponse>> getMyProfile(
            Authentication authentication
    ) {
        SettingsProfileResponse response = settingsService.getMyProfile(
                AuthenticationUtils.extractAuthenticatedUser(authentication)
        );
        return ResponseEntity.ok(ApiResponse.success("Profile settings loaded.", response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<SettingsProfileResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody SettingsProfileUpdateRequest request
    ) {
        SettingsProfileResponse response = settingsService.updateMyProfile(
                AuthenticationUtils.extractAuthenticatedUser(authentication),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Profile settings updated.", response));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            Authentication authentication,
            @Valid @RequestBody SettingsPasswordUpdateRequest request
    ) {
        settingsService.updatePassword(
                AuthenticationUtils.extractAuthenticatedUser(authentication),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Password updated."));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<NotificationSettingResponse>> getNotificationSettings(
            Authentication authentication
    ) {
        NotificationSettingResponse response = settingsService.getNotificationSettings(
                AuthenticationUtils.extractAuthenticatedUser(authentication)
        );
        return ResponseEntity.ok(ApiResponse.success("Notification settings loaded.", response));
    }

    @PutMapping("/notifications")
    public ResponseEntity<ApiResponse<NotificationSettingResponse>> updateNotificationSettings(
            Authentication authentication,
            @Valid @RequestBody NotificationSettingUpdateRequest request
    ) {
        NotificationSettingResponse response = settingsService.updateNotificationSettings(
                AuthenticationUtils.extractAuthenticatedUser(authentication),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Notification settings updated.", response));
    }

    @GetMapping("/display")
    public ResponseEntity<ApiResponse<DisplaySettingResponse>> getDisplaySettings(
            Authentication authentication
    ) {
        DisplaySettingResponse response = settingsService.getDisplaySettings(
                AuthenticationUtils.extractAuthenticatedUser(authentication)
        );
        return ResponseEntity.ok(ApiResponse.success("Display settings loaded.", response));
    }

    @GetMapping("/project-create-policy")
    public ResponseEntity<ApiResponse<ProjectCreationPolicyResponse>> getProjectCreationPolicy() {
        ProjectCreationPolicyResponse response = settingsService.getProjectCreationPolicy();
        return ResponseEntity.ok(ApiResponse.success("Project creation policy loaded.", response));
    }

    @PutMapping("/display")
    public ResponseEntity<ApiResponse<DisplaySettingResponse>> updateDisplaySettings(
            Authentication authentication,
            @Valid @RequestBody DisplaySettingUpdateRequest request
    ) {
        DisplaySettingResponse response = settingsService.updateDisplaySettings(
                AuthenticationUtils.extractAuthenticatedUser(authentication),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Display settings updated.", response));
    }

    @GetMapping("/project-defaults")
    public ResponseEntity<ApiResponse<ProjectDefaultSettingResponse>> getProjectDefaultSettings(
            Authentication authentication
    ) {
        ProjectDefaultSettingResponse response = settingsService.getProjectDefaultSettings(
                AuthenticationUtils.extractAuthenticatedUser(authentication)
        );
        return ResponseEntity.ok(ApiResponse.success("Project default settings loaded.", response));
    }

    @PutMapping("/project-defaults")
    public ResponseEntity<ApiResponse<ProjectDefaultSettingResponse>> updateProjectDefaultSettings(
            Authentication authentication,
            @Valid @RequestBody ProjectDefaultSettingUpdateRequest request
    ) {
        ProjectDefaultSettingResponse response = settingsService.updateProjectDefaultSettings(
                AuthenticationUtils.extractAuthenticatedUser(authentication),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Project default settings updated.", response));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<AdminSettingResponse>> getAdminSettings() {
        AdminSettingResponse response = settingsService.getAdminSettings();
        return ResponseEntity.ok(ApiResponse.success("Admin settings loaded.", response));
    }

    @PutMapping("/admin")
    public ResponseEntity<ApiResponse<AdminSettingResponse>> updateAdminSettings(
            @Valid @RequestBody AdminSettingUpdateRequest request
    ) {
        AdminSettingResponse response = settingsService.updateAdminSettings(request);
        return ResponseEntity.ok(ApiResponse.success("Admin settings updated.", response));
    }
}
