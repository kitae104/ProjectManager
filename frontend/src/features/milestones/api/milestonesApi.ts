import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type {
  Milestone,
  MilestoneCreateRequest,
  MilestoneUpdateRequest,
} from '../types/milestone'

export async function getProjectMilestones(projectId: number) {
  const response = await httpClient.get<ApiResponse<Milestone[]>>(
    `/api/projects/${projectId}/milestones`,
  )
  return response.data
}

export async function createMilestone(
  projectId: number,
  request: MilestoneCreateRequest,
) {
  const response = await httpClient.post<ApiResponse<Milestone>>(
    `/api/projects/${projectId}/milestones`,
    request,
  )
  return response.data
}

export async function updateMilestone(
  milestoneId: number,
  request: MilestoneUpdateRequest,
) {
  const response = await httpClient.put<ApiResponse<Milestone>>(
    `/api/milestones/${milestoneId}`,
    request,
  )
  return response.data
}

export async function deleteMilestone(milestoneId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(
    `/api/milestones/${milestoneId}`,
  )
  return response.data
}

