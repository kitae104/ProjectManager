import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addProjectMember,
  deleteProject,
  deleteProjectMember,
  getProject,
  getProjectMembers,
  updateProject,
} from '../features/projects/api/projectsApi'
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

const memberRoleOptions: ProjectMemberRole[] = [
  'LEADER',
  'FRONTEND',
  'BACKEND',
  'AI',
  'DESIGN',
  'PM',
  'DOCS',
  'PRESENTER',
]

export function ProjectDetailPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const numericProjectId = Number(projectId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [semester, setSemester] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('DEVELOPMENT')
  const [status, setStatus] = useState<ProjectStatus>('PLANNING')
  const [progress, setProgress] = useState(0)
  const [memberUserId, setMemberUserId] = useState('')
  const [memberRole, setMemberRole] = useState<ProjectMemberRole>('FRONTEND')
  const [responsibility, setResponsibility] = useState('')

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

  useEffect(() => {
    if (projectQuery.data?.data) {
      const project = projectQuery.data.data
      setTitle(project.title)
      setDescription(project.description)
      setSemester(project.semester ?? '')
      setCategory(project.category)
      setStatus(project.status)
      setProgress(project.progress)
    }
  }, [projectQuery.data])

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProject(numericProjectId, {
        title,
        description,
        category,
        status,
        semester,
        startDate: null,
        endDate: null,
        progress,
        leaderId: projectQuery.data?.data.leaderId ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', numericProjectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(numericProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/projects')
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: () =>
      addProjectMember(numericProjectId, {
        userId: Number(memberUserId),
        projectRole: memberRole,
        responsibility,
      }),
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">프로젝트 상세</h2>
      </div>

      <form
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault()
          updateMutation.mutate()
        }}
      >
        <h3 className="text-base font-semibold text-slate-900">프로젝트 정보 수정</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
            required
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={category}
            onChange={(event) => setCategory(event.target.value as ProjectCategory)}
          >
            {categoryOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProjectStatus)}
          >
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={100}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
          />
          <textarea
            className="md:col-span-2 min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

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
            onClick={() => deleteMutation.mutate()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '삭제 중...' : '프로젝트 삭제'}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">팀원 관리</h3>
        <form
          className="mt-4 grid gap-3 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault()
            addMemberMutation.mutate()
          }}
        >
          <input
            type="number"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="사용자 ID"
            value={memberUserId}
            onChange={(event) => setMemberUserId(event.target.value)}
            required
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={memberRole}
            onChange={(event) => setMemberRole(event.target.value as ProjectMemberRole)}
          >
            {memberRoleOptions.map((value) => (
              <option key={value} value={value}>
                {value}
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
            disabled={addMemberMutation.isPending}
          >
            {addMemberMutation.isPending ? '추가 중...' : '팀원 추가'}
          </button>
        </form>

        <div className="mt-5 space-y-2">
          {membersQuery.isLoading && (
            <p className="text-sm text-slate-500">팀원 목록을 불러오는 중입니다.</p>
          )}
          {membersQuery.isSuccess &&
            membersQuery.data.data.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {member.name} ({member.projectRole})
                  </p>
                  <p className="text-xs text-slate-500">
                    ID: {member.userId} · {member.email} · {member.responsibility ?? '-'}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => removeMemberMutation.mutate(member.id)}
                >
                  제거
                </button>
              </div>
            ))}
        </div>
      </div>

      {projectQuery.isError && (
        <p className="text-sm text-red-600">
          프로젝트 정보를 조회하지 못했습니다. 권한 또는 토큰을 확인해 주세요.
        </p>
      )}
    </section>
  )
}
