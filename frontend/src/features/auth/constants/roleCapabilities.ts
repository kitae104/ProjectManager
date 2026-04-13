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
      '전체 프로젝트 생성 및 관리',
      '프로젝트 기본값 설정 관리',
      '시스템 관리자 설정 관리',
    ],
  },
  LEADER: {
    menu: workspaceMenu,
    canCreateProject: true,
    canManageProjectDefaults: true,
    canManageAdminSettings: false,
    features: [
      '팀 프로젝트 생성 및 리드',
      '프로젝트 기본값 템플릿 관리',
      '팀 일정, 업무, 마일스톤 운영',
    ],
  },
  MEMBER: {
    menu: workspaceMenu,
    canCreateProject: true,
    canManageProjectDefaults: false,
    canManageAdminSettings: false,
    features: [
      '프로젝트 생성 및 참여',
      '개인 알림/화면 설정 관리',
      '할당 업무 수행 및 협업',
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
