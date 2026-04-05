export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'BLOCKED'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type Task = {
  id: number
  projectId: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: number | null
  assigneeName: string | null
  reporterId: number | null
  reporterName: string | null
  startDate: string | null
  dueDate: string | null
  progress: number
  createdAt: string
  updatedAt: string
}

export type TaskCreateRequest = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: number | null
  reporterId: number | null
  startDate: string | null
  dueDate: string | null
  progress: number
}

export type TaskUpdateRequest = TaskCreateRequest

export type TaskStatusUpdateRequest = {
  status: TaskStatus
}

