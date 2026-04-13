import type { ProjectMemberRole } from '../types/project'

const PROJECT_MEMBER_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  LEADER: '팀장',
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  AI: 'AI',
  DESIGN: '디자인',
  PM: 'PM',
  DOCS: '문서',
  PRESENTER: '발표',
}

export function getProjectMemberRoleLabel(role: ProjectMemberRole): string {
  return PROJECT_MEMBER_ROLE_LABELS[role]
}
