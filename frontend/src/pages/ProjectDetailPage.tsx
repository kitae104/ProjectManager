import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import {
  addProjectMember,
  deleteProject,
  deleteProjectMember,
  getProject,
  getProjectMembers,
  updateProject,
} from '../features/projects/api/projectsApi'
import { getProjectMemberRoleLabel } from '../features/projects/constants/projectMemberRoleLabels'
import { getUsers } from '../features/users/api/usersApi'
import type {
  ProjectCategory,
  ProjectMemberRole,
  ProjectStatus,
} from '../features/projects/types/project'

const categoryOptions: ProjectCategory[] = [
  'CAPSTONE',
  'STARTUP',
  'AI',
  'DEVELOPMENT',
  'ETC',
]

const statusOptions: ProjectStatus[] = [
  'PLANNING',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
  'ON_HOLD',
  'DELAYED',
]

const categoryLabels: Record<ProjectCategory, string> = {
  CAPSTONE: '캡스톤',
  STARTUP: '스타트업',
  AI: 'AI',
  DEVELOPMENT: '개발',
  ETC: '기타',
}

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: '기획',
  IN_PROGRESS: '진행 중',
  REVIEW: '검토',
  COMPLETED: '완료',
  ON_HOLD: '보류',
  DELAYED: '지연',
}

const memberRoleOptions: ProjectMemberRole[] = [
  'FRONTEND',
  'BACKEND',
  'AI',
  'DESIGN',
  'PM',
  'DOCS',
  'PRESENTER',
]

type ActionNotice = {
  type: 'info' | 'success' | 'error'
  text: string
}

function getActionErrorMessage(error: unknown, fallbackMessage: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallbackMessage
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export function ProjectDetailPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [semester, setSemester] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('DEVELOPMENT')
  const [status, setStatus] = useState<ProjectStatus>('PLANNING')
  const [progress, setProgress] = useState(0)
  const [leaderId, setLeaderId] = useState('')
  const [memberUserId, setMemberUserId] = useState('')
  const [memberRole, setMemberRole] = useState<ProjectMemberRole>('FRONTEND')
  const [responsibility, setResponsibility] = useState('')
  const [projectInfoNotice, setProjectInfoNotice] = useState<ActionNotice | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const projectQuery = useQuery({
    queryKey: ['project', numericProjectId],
    queryFn: () => getProject(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const membersQuery = useQuery({
    queryKey: ['project-members', numericProjectId],
    queryFn: () => getProjectMembers(numericProjectId),
    enabled: Number.isFinite(numericProjectId),
  })

  const project = projectQuery.data?.data ?? null
  const members = membersQuery.data?.data ?? []
  const isAdmin = currentUser?.role === 'ADMIN'
  const isProjectLeader =
    currentUser?.role === 'LEADER' &&
    project?.leaderId != null &&
    project.leaderId === currentUser.id
  const canManageProjectInfo = isAdmin || isProjectLeader

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: canManageProjectInfo,
  })

  const leaderCandidates = useMemo(
    () => (usersQuery.data?.data ?? []).filter((user) => user.role === 'LEADER'),
    [usersQuery.data],
  )

  const candidateUsers = useMemo(() => {
    const existingUserIds = new Set(members.map((member) => member.userId))
    return (usersQuery.data?.data ?? []).filter((user) => !existingUserIds.has(user.id))
  }, [members, usersQuery.data])

  const selectedLeaderId = useMemo(() => {
    if (!isAdmin) {
      return project?.leaderId ?? null
    }

    if (!leaderId) {
      return null
    }

    const numericLeaderId = Number(leaderId)
    return Number.isFinite(numericLeaderId) ? numericLeaderId : null
  }, [isAdmin, leaderId, project?.leaderId])

  const hasProjectChanges = useMemo(() => {
    if (!project) {
      return false
    }

    return (
      title !== project.title ||
      description !== project.description ||
      semester !== (project.semester ?? '') ||
      category !== project.category ||
      status !== project.status ||
      progress !== project.progress ||
      (isAdmin && selectedLeaderId !== project.leaderId)
    )
  }, [
    project,
    title,
    description,
    semester,
    category,
    status,
    progress,
    isAdmin,
    selectedLeaderId,
  ])

  useEffect(() => {
    if (projectQuery.data?.data) {
      const project = projectQuery.data.data
      setTitle(project.title)
      setDescription(project.description)
      setSemester(project.semester ?? '')
      setCategory(project.category)
      setStatus(project.status)
      setProgress(project.progress)
      setLeaderId(project.leaderId == null ? '' : String(project.leaderId))
    }
  }, [projectQuery.data])

  useEffect(() => {
    if (!isAdmin || leaderId || leaderCandidates.length === 0) {
      return
    }

    setLeaderId(String(leaderCandidates[0].id))
  }, [isAdmin, leaderId, leaderCandidates])

  useEffect(() => {
    if (!isProjectLeader) {
      return
    }

    setMemberUserId((prev) => prev || (candidateUsers[0] ? String(candidateUsers[0].id) : ''))
  }, [candidateUsers, isProjectLeader])

  const updateMutation = useMutation({
    mutationFn: () => {
      if (isAdmin && selectedLeaderId == null) {
        throw new Error('팀장을 선택해 주세요.')
      }

      return updateProject(numericProjectId, {
        title,
        description,
        category,
        status,
        semester,
        startDate: null,
        endDate: null,
        progress,
        leaderId: selectedLeaderId,
      })
    },
    onMutate: () => {
      setProjectInfoNotice(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', numericProjectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-members', numericProjectId] })
      setProjectInfoNotice({ type: 'success', text: '프로젝트 정보를 저장했습니다.' })
    },
    onError: (error) => {
      setProjectInfoNotice({
        type: 'error',
        text: getActionErrorMessage(error, '프로젝트 저장에 실패했습니다.'),
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(numericProjectId),
    onMutate: () => {
      setProjectInfoNotice(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      if (window.history.length > 1) {
        navigate(-1)
        return
      }
      navigate('/projects')
    },
    onError: (error) => {
      setProjectInfoNotice({
        type: 'error',
        text: getActionErrorMessage(error, '프로젝트 삭제에 실패했습니다.'),
      })
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: () => {
      if (!memberUserId) {
        throw new Error('추가할 팀원을 선택해 주세요.')
      }

      return addProjectMember(numericProjectId, {
        userId: Number(memberUserId),
        projectRole: memberRole,
        responsibility,
      })
    },
    onSuccess: () => {
      setMemberUserId('')
      setResponsibility('')
      queryClient.invalidateQueries({ queryKey: ['project-members', numericProjectId] })
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => deleteProjectMember(numericProjectId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', numericProjectId] })
    },
  })

  if (!Number.isFinite(numericProjectId)) {
    return <p className="text-sm text-red-600">유효하지 않은 프로젝트 ID입니다.</p>
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">프로젝트 상세</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            onClick={() => navigate(`/projects/${numericProjectId}/board`)}
          >
            칸반 보드 이동
          </button>
          <button
            type="button"
            className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate(`/projects/${numericProjectId}/calendar`)}
          >
            캘린더 이동
          </button>
          <button
            type="button"
            className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
            onClick={() => navigate(`/projects/${numericProjectId}/documents`)}
          >
            문서 이동
          </button>
          <button
            type="button"
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            onClick={() => navigate(`/projects/${numericProjectId}/meetings`)}
          >
            회의록 이동
          </button>
          <button
            type="button"
            className="rounded-lg border border-fuchsia-300 px-4 py-2 text-sm font-semibold text-fuchsia-700 hover:bg-fuchsia-50"
            onClick={() => navigate(`/projects/${numericProjectId}/ai`)}
          >
            AI 인사이트 이동
          </button>
        </div>
      </div>

      <form
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault()
          if (!canManageProjectInfo) {
            return
          }
          if (!hasProjectChanges) {
            setProjectInfoNotice({ type: 'info', text: '변경된 내용이 없어 저장하지 않았습니다.' })
            return
          }
          updateMutation.mutate()
        }}
      >
        <h3 className="text-base font-semibold text-slate-900">프로젝트 정보</h3>
        {!canManageProjectInfo && (
          <p className="mt-1 text-sm text-slate-600">
            현재 계정은 조회 전용입니다. 프로젝트 수정은 관리자 또는 해당 프로젝트 팀장만 가능합니다.
          </p>
        )}
        {projectInfoNotice && (
          <p
            className={`mt-2 text-sm ${
              projectInfoNotice.type === 'success'
                ? 'text-emerald-700'
                : projectInfoNotice.type === 'error'
                  ? 'text-red-600'
                  : 'text-slate-600'
            }`}
          >
            {projectInfoNotice.text}
          </p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="project-title" className="text-sm font-medium text-slate-700">
              프로젝트 제목
            </label>
            <input
              id="project-title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!canManageProjectInfo}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="project-semester" className="text-sm font-medium text-slate-700">
              학기
            </label>
            <input
              id="project-semester"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
              disabled={!canManageProjectInfo}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="project-category" className="text-sm font-medium text-slate-700">
              카테고리
            </label>
            <select
              id="project-category"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={category}
              onChange={(event) => setCategory(event.target.value as ProjectCategory)}
              disabled={!canManageProjectInfo}
            >
              {categoryOptions.map((value) => (
                <option key={value} value={value}>
                  {categoryLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="project-status" className="text-sm font-medium text-slate-700">
              상태
            </label>
            <select
              id="project-status"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={status}
              onChange={(event) => setStatus(event.target.value as ProjectStatus)}
              disabled={!canManageProjectInfo}
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="project-leader" className="text-sm font-medium text-slate-700">
              팀장
            </label>
            {isAdmin ? (
              <select
                id="project-leader"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={leaderId}
                onChange={(event) => setLeaderId(event.target.value)}
                required
              >
                {leaderCandidates.length === 0 && <option value="">팀장 사용자 없음</option>}
                {leaderCandidates.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name} ({leader.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="project-leader"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={project?.leaderName ?? '-'}
                disabled
                readOnly
              />
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="project-progress" className="text-sm font-medium text-slate-700">
              진행률 (%)
            </label>
            <input
              id="project-progress"
              type="number"
              min={0}
              max={100}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={progress}
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                setProgress(Number.isFinite(nextValue) ? nextValue : 0)
              }}
              disabled={!canManageProjectInfo}
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label htmlFor="project-description" className="text-sm font-medium text-slate-700">
              프로젝트 설명
            </label>
            <textarea
              id="project-description"
              className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!canManageProjectInfo}
              required
            />
          </div>
        </div>

        {canManageProjectInfo && (
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? '저장 중...' : '프로젝트 저장'}
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '프로젝트 삭제'}
            </button>
          </div>
        )}
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">팀원 관리</h3>
        {isProjectLeader ? (
          <form
            className="mt-4 grid gap-3 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault()
              addMemberMutation.mutate()
            }}
          >
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={memberUserId}
              onChange={(event) => setMemberUserId(event.target.value)}
              required
            >
              {candidateUsers.length === 0 && <option value="">추가 가능한 사용자 없음</option>}
              {candidateUsers.map((candidateUser) => (
                <option key={candidateUser.id} value={candidateUser.id}>
                  {candidateUser.name} ({candidateUser.email})
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={memberRole}
              onChange={(event) => setMemberRole(event.target.value as ProjectMemberRole)}
            >
              {memberRoleOptions.map((value) => (
                <option key={value} value={value}>
                  {getProjectMemberRoleLabel(value)}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="책임 영역"
              value={responsibility}
              onChange={(event) => setResponsibility(event.target.value)}
            />
            <button
              type="submit"
              className="md:col-span-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              disabled={addMemberMutation.isPending || candidateUsers.length === 0}
            >
              {addMemberMutation.isPending ? '추가 중...' : '팀원 추가'}
            </button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            팀원 추가/역할 지정은 해당 프로젝트 팀장만 가능합니다.
          </p>
        )}

        <div className="mt-5 space-y-2">
          {membersQuery.isLoading && (
            <p className="text-sm text-slate-500">팀원 목록을 불러오는 중입니다.</p>
          )}
          {membersQuery.isSuccess &&
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {member.name} ({getProjectMemberRoleLabel(member.projectRole)})
                  </p>
                  <p className="text-xs text-slate-500">
                    ID: {member.userId} · {member.email} · {member.responsibility ?? '-'}
                  </p>
                </div>
                {isProjectLeader && member.projectRole !== 'LEADER' && (
                  <button
                    type="button"
                    className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => removeMemberMutation.mutate(member.id)}
                  >
                    제거
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {projectQuery.isError && (
        <p className="text-sm text-red-600">
          프로젝트 정보를 조회하지 못했습니다. 권한 또는 토큰을 확인해 주세요.
        </p>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">프로젝트 삭제 확인</h3>
            <p className="mt-2 text-sm text-slate-600">
              프로젝트를 삭제하면 관련된 업무/문서/회의록/일정/팀원 데이터도 함께 삭제됩니다. 정말 삭제하시겠습니까?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={deleteMutation.isPending}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  deleteMutation.mutate()
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
