export type UserRole =
  | 'ADMIN'
  | 'PROFESSOR'
  | 'MENTOR'
  | 'LEADER'
  | 'MEMBER'
  | 'VIEWER'

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  department: string | null
  profileImage: string | null
}

export type AuthTokenPayload = {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export type LoginRequest = {
  email: string
  password: string
}

export type SignupRequest = {
  name: string
  email: string
  password: string
  role: UserRole
  department: string
}

