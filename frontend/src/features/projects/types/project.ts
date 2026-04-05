export type ProjectCategory = 'CAPSTONE' | 'STARTUP' | 'AI' | 'DEVELOPMENT' | 'ETC'
export type ProjectStatus =
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'DELAYED'

export type Project = {
  id: number
  title: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  semester: string | null
  startDate: string | null
  endDate: string | null
  progress: number
  leaderId: number | null
  leaderName: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectMemberRole =
  | 'LEADER'
  | 'FRONTEND'
  | 'BACKEND'
  | 'AI'
  | 'DESIGN'
  | 'PM'
  | 'DOCS'
  | 'PRESENTER'

export type ProjectMember = {
  id: number
  userId: number
  name: string
  email: string
  projectRole: ProjectMemberRole
  responsibility: string | null
  joinedAt: string
}

export type ProjectCreateRequest = {
  title: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  semester: string
  startDate: string | null
  endDate: string | null
  progress: number
  leaderId: number | null
}

export type ProjectUpdateRequest = ProjectCreateRequest

export type ProjectMemberCreateRequest = {
  userId: number
  projectRole: ProjectMemberRole
  responsibility: string
}

