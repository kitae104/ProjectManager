package com.projectmanager.backend.schedule.api;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.auth.security.AuthenticationUtils;
import com.projectmanager.backend.common.response.ApiResponse;
import com.projectmanager.backend.schedule.application.ScheduleService;
import com.projectmanager.backend.schedule.dto.ScheduleCreateRequest;
import com.projectmanager.backend.schedule.dto.ScheduleResponse;
import com.projectmanager.backend.schedule.dto.ScheduleUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/api/projects/{id}/schedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getProjectSchedules(
            @PathVariable("id") Long projectId,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        List<ScheduleResponse> response = scheduleService.getProjectSchedules(projectId, user);
        return ResponseEntity.ok(ApiResponse.success("일정 목록을 조회했습니다.", response));
    }

    @PostMapping("/api/projects/{id}/schedules")
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            @PathVariable("id") Long projectId,
            @Valid @RequestBody ScheduleCreateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        ScheduleResponse response = scheduleService.createSchedule(projectId, request, user);
        return ResponseEntity.ok(ApiResponse.success("일정을 생성했습니다.", response));
    }

    @PutMapping("/api/schedules/{scheduleId}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @PathVariable("scheduleId") Long scheduleId,
            @Valid @RequestBody ScheduleUpdateRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        ScheduleResponse response = scheduleService.updateSchedule(scheduleId, request, user);
        return ResponseEntity.ok(ApiResponse.success("일정을 수정했습니다.", response));
    }

    @DeleteMapping("/api/schedules/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @PathVariable("scheduleId") Long scheduleId,
            Authentication authentication
    ) {
        AuthenticatedUser user = AuthenticationUtils.extractAuthenticatedUser(authentication);
        scheduleService.deleteSchedule(scheduleId, user);
        return ResponseEntity.ok(ApiResponse.success("일정을 삭제했습니다."));
    }
}
