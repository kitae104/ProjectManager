import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type {
  Project,
  ProjectCreateRequest,
  ProjectMember,
  ProjectMemberCreateRequest,
  ProjectUpdateRequest,
} from '../types/project'

export async function getProjects() {
  const response = await httpClient.get<ApiResponse<Project[]>>('/api/projects')
  return response.data
}

export async function createProject(request: ProjectCreateRequest) {
  const response = await httpClient.post<ApiResponse<Project>>('/api/projects', request)
  return response.data
}

export async function getProject(projectId: number) {
  const response = await httpClient.get<ApiResponse<Project>>(`/api/projects/${projectId}`)
  return response.data
}

export async function updateProject(projectId: number, request: ProjectUpdateRequest) {
  const response = await httpClient.put<ApiResponse<Project>>(
    `/api/projects/${projectId}`,
    request,
  )
  return response.data
}

export async function deleteProject(projectId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(`/api/projects/${projectId}`)
  return response.data
}

export async function getProjectMembers(projectId: number) {
  const response = await httpClient.get<ApiResponse<ProjectMember[]>>(
    `/api/projects/${projectId}/members`,
  )
  return response.data
}

export async function addProjectMember(
  projectId: number,
  request: ProjectMemberCreateRequest,
) {
  const response = await httpClient.post<ApiResponse<ProjectMember>>(
    `/api/projects/${projectId}/members`,
    request,
  )
  return response.data
}

export async function deleteProjectMember(projectId: number, memberId: number) {
  const response = await httpClient.delete<ApiResponse<null>>(
    `/api/projects/${projectId}/members/${memberId}`,
  )
  return response.data
}

