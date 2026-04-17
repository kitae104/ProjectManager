import type { UserRole } from '../types/auth'

export type MenuKey = 'dashboard' | 'projects' | 'settings'

export type RoleCapability = {
  menu: MenuKey[]
  canCreateProject: boolean
  canManageProjectDefaults: boolean
  canManageAdminSettings: boolean
  features: string[]
}

const adminMenu: MenuKey[] = ['dashboard', 'projects', 'settings']
const workspaceMenu: MenuKey[] = ['dashboard', 'projects']

const ROLE_CAPABILITIES: Record<UserRole, RoleCapability> = {
  ADMIN: {
    menu: adminMenu,
    canCreateProject: true,
    canManageProjectDefaults: true,
    canManageAdminSettings: true,
    features: [
      '프로젝트 생성 및 팀장 지정',
      '전체 프로젝트 현황 조회',
      '플랫폼 관리자 설정 관리',
    ],
  },
  LEADER: {
    menu: workspaceMenu,
    canCreateProject: false,
    canManageProjectDefaults: true,
    canManageAdminSettings: false,
    features: [
      '본인이 맡은 프로젝트 관리',
      '팀원 추가 및 역할 지정',
      '팀 Todo 작성 및 진행 관리',
    ],
  },
  MEMBER: {
    menu: workspaceMenu,
    canCreateProject: false,
    canManageProjectDefaults: false,
    canManageAdminSettings: false,
    features: [
      '참여 프로젝트 조회',
      '할당된 Todo 일정 계획',
      '내 업무 진행 상태 업데이트',
    ],
  },
}

export function getRoleCapability(role?: UserRole | null): RoleCapability {
  if (!role) {
    return {
      menu: [],
      canCreateProject: false,
      canManageProjectDefaults: false,
      canManageAdminSettings: false,
      features: [],
    }
  }

  return ROLE_CAPABILITIES[role]
}

export function canRoleCreateProject(role: UserRole | null | undefined): boolean {
  if (!role) {
    return false
  }

  return getRoleCapability(role).canCreateProject
}
