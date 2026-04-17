package com.projectmanager.backend.schedule.application;

import com.projectmanager.backend.auth.security.AuthenticatedUser;
import com.projectmanager.backend.project.application.ProjectAccessService;
import com.projectmanager.backend.project.domain.Project;
import com.projectmanager.backend.schedule.domain.Schedule;
import com.projectmanager.backend.schedule.domain.ScheduleRepository;
import com.projectmanager.backend.schedule.dto.ScheduleCreateRequest;
import com.projectmanager.backend.schedule.dto.ScheduleResponse;
import com.projectmanager.backend.schedule.dto.ScheduleUpdateRequest;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ProjectAccessService projectAccessService;

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getProjectSchedules(Long projectId, AuthenticatedUser authenticatedUser) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanViewProject(authenticatedUser, project);

        return scheduleRepository.findByProjectIdOrderByStartDateTimeAsc(projectId)
                .stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    @Transactional
    public ScheduleResponse createSchedule(
            Long projectId,
            ScheduleCreateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Project project = projectAccessService.findProject(projectId);
        projectAccessService.validateCanManageProject(authenticatedUser, project);
        validateDateTimeRange(request.startDateTime(), request.endDateTime());

        Schedule schedule = Schedule.create(
                project,
                request.title(),
                request.description(),
                request.scheduleType(),
                request.startDateTime(),
                request.endDateTime(),
                request.location()
        );
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return ScheduleResponse.from(savedSchedule);
    }

    @Transactional
    public ScheduleResponse updateSchedule(
            Long scheduleId,
            ScheduleUpdateRequest request,
            AuthenticatedUser authenticatedUser
    ) {
        Schedule schedule = findSchedule(scheduleId);
        projectAccessService.validateCanManageProject(authenticatedUser, schedule.getProject());
        validateDateTimeRange(request.startDateTime(), request.endDateTime());

        schedule.update(
                request.title(),
                request.description(),
                request.scheduleType(),
                request.startDateTime(),
                request.endDateTime(),
                request.location()
        );
        return ScheduleResponse.from(schedule);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId, AuthenticatedUser authenticatedUser) {
        Schedule schedule = findSchedule(scheduleId);
        projectAccessService.validateCanManageProject(authenticatedUser, schedule.getProject());
        scheduleRepository.delete(schedule);
    }

    private void validateDateTimeRange(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (!endDateTime.isAfter(startDateTime)) {
            throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }
    }

    private Schedule findSchedule(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
    }
}
