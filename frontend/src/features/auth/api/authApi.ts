import { httpClient } from '../../../services/httpClient'
import type { ApiResponse } from '../../../types/api'
import type {
  AuthTokenPayload,
  LoginRequest,
  SignupRequest,
  User,
} from '../types/auth'

export async function signup(request: SignupRequest) {
  const response = await httpClient.post<ApiResponse<AuthTokenPayload>>(
    '/api/auth/signup',
    request,
  )
  return response.data
}

export async function login(request: LoginRequest) {
  const response = await httpClient.post<ApiResponse<AuthTokenPayload>>(
    '/api/auth/login',
    request,
  )
  return response.data
}

export async function getMyInfo() {
  const response = await httpClient.get<ApiResponse<User>>('/api/auth/me')
  return response.data
}

