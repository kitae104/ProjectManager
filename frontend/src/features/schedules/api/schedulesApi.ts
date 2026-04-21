import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type {
  Schedule,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
} from '../types/schedule'

export async function getProjectSchedules(projectId: number) {
  const response = await httpClient.get<ApiResponse<Schedule[]>>(
    `/api/projects/${projectId}/schedules`,
  )
  return response.data
}

export async function createSchedule(
  projectId: number,
  request: ScheduleCreateRequest,
) {
  const response = await httpClient.post<ApiResponse<Schedule>>(
    `/api/projects/${projectId}/schedules`,
    request,
  )
  return response.data
}

export async function updateSchedule(
  scheduleId: number,
  request: ScheduleUpdateRequest,
) {
  const response = await httpClient.put<ApiResponse<Schedule>>(
    `/api/schedules/${scheduleId}`,
    request,
  )
  return response.data
}

export async function deleteSchedule(scheduleId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(
    `/api/schedules/${scheduleId}`,
  )
  return response.data
}

export type ScheduleEmailNotificationResult = {
  recipientCount: number
}

export async function sendScheduleNotificationEmail(scheduleId: number) {
  const response = await httpClient.post<ApiResponse<ScheduleEmailNotificationResult>>(
    `/api/schedules/${scheduleId}/notify-email`,
  )
  return response.data
}
