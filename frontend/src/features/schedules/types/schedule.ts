export type ScheduleType =
  | 'MEETING'
  | 'PRESENTATION'
  | 'SUBMISSION'
  | 'DEMO'
  | 'MENTORING'
  | 'INTERNAL_REVIEW'

export type Schedule = {
  id: number
  projectId: number
  title: string
  description: string
  scheduleType: ScheduleType
  startDateTime: string
  endDateTime: string
  location: string | null
  createdAt: string
  updatedAt: string
}

export type ScheduleCreateRequest = {
  title: string
  description: string
  scheduleType: ScheduleType
  startDateTime: string
  endDateTime: string
  location: string | null
}

export type ScheduleUpdateRequest = ScheduleCreateRequest

