import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type { ProjectCreationPolicy } from '../types/settings'

export async function getViewerProjectCreationPolicy() {
  const response = await httpClient.get<ApiResponse<ProjectCreationPolicy>>(
    '/api/projects/policies/viewer-project-creation',
  )
  return response.data
}
