export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED'

export type Milestone = {
  id: number
  projectId: number
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
  createdAt: string
  updatedAt: string
}

export type MilestoneCreateRequest = {
  title: string
  description: string
  dueDate: string
  status: MilestoneStatus
}

export type MilestoneUpdateRequest = MilestoneCreateRequest

