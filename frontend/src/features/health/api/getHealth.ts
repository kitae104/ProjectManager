import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'

export type HealthCheckData = {
  service: string
  status: string
  timestamp: string
}

export async function getHealth() {
  const response = await httpClient.get<ApiResponse<HealthCheckData>>('/api/health')
  return response.data
}

