import type { ProjectCategory, ProjectStatus } from '../../projects/types/project'
import type { UserRole } from '../../auth/types/auth'

export type SettingsProfile = {
  id: number
  name: string
  email: string
  role: UserRole
  department: string | null
  profileImage: string | null
}

export type SettingsProfileUpdateRequest = {
  name: string
  department: string
  profileImage: string
}

export type SettingsPasswordUpdateRequest = {
  currentPassword: string
  newPassword: string
}

export type NotificationSettings = {
  deadlineAlertEnabled: boolean
  blockedTaskAlertEnabled: boolean
  meetingScheduleAlertEnabled: boolean
}

export type DisplayTheme = 'LIGHT' | 'DARK'

export type DisplaySettings = {
  theme: DisplayTheme
  sidebarCollapsedDefault: boolean
}

export type ProjectDefaultSettings = {
  defaultCategory: ProjectCategory
  defaultStatus: ProjectStatus
  defaultDescriptionTemplate: string
  roleAutoSuggestionEnabled: boolean
  defaultMilestoneTemplate: string
}

export type AdminSettings = {
  roleChangeApprovalRequired: boolean
  viewerProjectCreationAllowed: boolean
  corsSecurityPolicyNote: string
  fileUploadLimitMb: number
  defaultSemester: string
  projectNamingRule: string
}

export type ProjectCreationPolicy = {
  viewerProjectCreationAllowed: boolean
}
