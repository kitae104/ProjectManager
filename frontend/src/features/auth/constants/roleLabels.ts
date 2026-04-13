import type { UserRole } from '../types/auth'

const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: '관리자',
  LEADER: '팀장',
  MEMBER: '팀원',
}

export function getUserRoleLabel(role?: UserRole | null): string {
  if (!role) {
    return '확인 불가'
  }
  return USER_ROLE_LABELS[role]
}
