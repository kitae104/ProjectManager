import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type {
  Task,
  TaskCreateRequest,
  TaskStatusUpdateRequest,
  TaskUpdateRequest,
} from '../types/task'

export async function getProjectTasks(projectId: number) {
  const response = await httpClient.get<ApiResponse<Task[]>>(
    `/api/projects/${projectId}/tasks`,
  )
  return response.data
}

export async function createTask(projectId: number, request: TaskCreateRequest) {
  const response = await httpClient.post<ApiResponse<Task>>(
    `/api/projects/${projectId}/tasks`,
    request,
  )
  return response.data
}

export async function getTask(taskId: number) {
  const response = await httpClient.get<ApiResponse<Task>>(`/api/tasks/${taskId}`)
  return response.data
}

export async function updateTask(taskId: number, request: TaskUpdateRequest) {
  const response = await httpClient.put<ApiResponse<Task>>(`/api/tasks/${taskId}`, request)
  return response.data
}

export async function deleteTask(taskId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(`/api/tasks/${taskId}`)
  return response.data
}

export async function updateTaskStatus(
  taskId: number,
  request: TaskStatusUpdateRequest,
) {
  const response = await httpClient.patch<ApiResponse<Task>>(
    `/api/tasks/${taskId}/status`,
    request,
  )
  return response.data
}

