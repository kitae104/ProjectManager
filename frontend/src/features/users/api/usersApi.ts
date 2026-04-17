import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type { User } from '../../auth/types/auth'

export async function getUsers() {
  const response = await httpClient.get<ApiResponse<User[]>>('/api/users')
  return response.data
}
