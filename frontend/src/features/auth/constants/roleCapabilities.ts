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
const projectWorkspaceMenu: MenuKey[] = ['dashboard', 'projects']

const ROLE_CAPABILITIES: Record<UserRole, RoleCapability> = {
  ADMIN: {
    menu: adminMenu,
    canCreateProject: true,
    canManageProjectDefaults: true,
    canManageAdminSettings: true,
    features: [
      '모든 프로젝트 생성 및 관리',
      '프로젝트 기본 템플릿 설정 관리',
      '시스템 관리자 정책 관리',
    ],
  },
  LEADER: {
    menu: projectWorkspaceMenu,
    canCreateProject: true,
    canManageProjectDefaults: true,
    canManageAdminSettings: false,
    features: [
      '팀 프로젝트 생성 및 리드',
      '프로젝트 기본 템플릿 관리',
      '팀원, 업무, 마일스톤 운영',
    ],
  },
  MEMBER: {
    menu: projectWorkspaceMenu,
    canCreateProject: true,
    canManageProjectDefaults: false,
    canManageAdminSettings: false,
    features: [
      '프로젝트 생성 및 참여',
      '내 프로필, 알림, 화면 설정 관리',
      '할당 업무 수행 및 협업',
    ],
  },
  MENTOR: {
    menu: projectWorkspaceMenu,
    canCreateProject: true,
    canManageProjectDefaults: true,
    canManageAdminSettings: false,
    features: [
      '멘토링 중심 프로젝트 생성',
      '멘토링 워크플로우용 기본 템플릿 사용',
      '진행 상황 및 피드백 활동 추적',
    ],
  },
  PROFESSOR: {
    menu: projectWorkspaceMenu,
    canCreateProject: true,
    canManageProjectDefaults: true,
    canManageAdminSettings: false,
    features: [
      '교과 단위 프로젝트 생성 및 모니터링',
      '학기 운영용 프로젝트 기본값 사용',
      '팀 진행 및 결과 상태 검토',
    ],
  },
  VIEWER: {
    menu: projectWorkspaceMenu,
    canCreateProject: false,
    canManageProjectDefaults: false,
    canManageAdminSettings: false,
    features: [
      '대시보드 및 프로젝트 정보 조회 전용',
      '내 프로필, 알림, 화면 설정 관리',
      '프로젝트 생성은 관리자 정책에 따름',
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

export function canRoleCreateProject(
  role: UserRole | null | undefined,
  viewerProjectCreationAllowed: boolean,
): boolean {
  if (!role) {
    return false
  }
  if (role === 'VIEWER') {
    return viewerProjectCreationAllowed
  }
  return getRoleCapability(role).canCreateProject
}
