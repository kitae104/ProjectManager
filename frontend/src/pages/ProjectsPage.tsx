import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  canRoleCreateProject,
  getRoleCapability,
} from '../features/auth/constants/roleCapabilities'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import { createProject, getProjects } from '../features/projects/api/projectsApi'
import type {
  ProjectCategory,
  ProjectCreateRequest,
  ProjectStatus,
} from '../features/projects/types/project'
import { getViewerProjectCreationPolicy } from '../features/settings/api/settingsApi'

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

export function ProjectsPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  const roleCapability = getRoleCapability(currentUser?.role)
  const isViewer = currentUser?.role === 'VIEWER'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [semester, setSemester] = useState('2026-1')
  const [category, setCategory] = useState<ProjectCategory>('DEVELOPMENT')
  const [status, setStatus] = useState<ProjectStatus>('PLANNING')
  const [keyword, setKeyword] = useState('')
  const [filterCategory, setFilterCategory] = useState<'ALL' | ProjectCategory>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | ProjectStatus>('ALL')

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const viewerPolicyQuery = useQuery({
    queryKey: ['viewer-project-creation-policy'],
    queryFn: getViewerProjectCreationPolicy,
    enabled: isViewer,
    staleTime: 1000 * 60,
  })

  const canCreateProject = canRoleCreateProject(
    currentUser?.role,
    viewerPolicyQuery.data?.data.viewerProjectCreationAllowed ?? false,
  )

  const createMutation = useMutation({
    mutationFn: (request: ProjectCreateRequest) => createProject(request),
    onSuccess: () => {
      setTitle('')
      setDescription('')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canCreateProject) {
      return
    }

    createMutation.mutate({
      title,
      description,
      category,
      status,
      semester,
      startDate: null,
      endDate: null,
      progress: 0,
      leaderId: currentUser?.id ?? null,
    })
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">프로젝트</h2>
        <p className="mt-1 text-sm text-slate-600">
          전체 프로젝트를 조회하고, 새 프로젝트를 생성한 뒤 상세 작업 공간으로 이동할 수 있습니다.
        </p>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          역할 권한
        </p>
        <p className="mt-2 text-sm text-slate-700">
          현재 역할: <span className="font-semibold">{currentUser?.role ?? '알 수 없음'}</span>
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {roleCapability.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </article>

      {canCreateProject ? (
        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleCreateProject}
        >
          <h3 className="text-base font-semibold text-slate-900">새 프로젝트 생성</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="프로젝트 제목"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="학기 (예: 2026-1)"
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
            <textarea
              className="md:col-span-2 min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="프로젝트 설명"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? '생성 중...' : '프로젝트 생성'}
          </button>
        </form>
      ) : (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-amber-900">프로젝트 생성이 제한되어 있습니다</h3>
          {!isViewer && (
            <p className="mt-2 text-sm text-amber-800">
              현재 역할에는 프로젝트 생성 권한이 없습니다.
            </p>
          )}
          {isViewer && viewerPolicyQuery.isLoading && (
            <p className="mt-2 text-sm text-amber-800">VIEWER 생성 정책을 확인 중입니다...</p>
          )}
          {isViewer && viewerPolicyQuery.isError && (
            <p className="mt-2 text-sm text-amber-800">
              VIEWER 정책을 불러오지 못했습니다. 백엔드 정책과 안전하게 맞추기 위해 생성은 차단됩니다.
            </p>
          )}
          {isViewer && viewerPolicyQuery.isSuccess && (
            <p className="mt-2 text-sm text-amber-800">
              현재 VIEWER 프로젝트 생성은 관리자 정책에 따라
              {' '}
              <span className="font-semibold">
                {viewerPolicyQuery.data.data.viewerProjectCreationAllowed ? '허용' : '차단'}
              </span>
              {' '}
              상태입니다.
            </p>
          )}
        </article>
      )}

      <div className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">검색 / 필터</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="제목 또는 설명 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={filterCategory}
              onChange={(event) =>
                setFilterCategory(event.target.value as 'ALL' | ProjectCategory)
              }
            >
              <option value="ALL">전체 카테고리</option>
              {categoryOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(event.target.value as 'ALL' | ProjectStatus)
              }
            >
              <option value="ALL">전체 상태</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {projectsQuery.isLoading && (
          <p className="text-sm text-slate-500">프로젝트 목록을 불러오는 중입니다...</p>
        )}

        {projectsQuery.isSuccess &&
          projectsQuery.data.data
            .filter((project) => {
              const searchBase = `${project.title} ${project.description}`.toLowerCase()
              const byKeyword = keyword.trim()
                ? searchBase.includes(keyword.trim().toLowerCase())
                : true
              const byCategory =
                filterCategory === 'ALL' ? true : project.category === filterCategory
              const byStatus = filterStatus === 'ALL' ? true : project.status === filterStatus
              return byKeyword && byCategory && byStatus
            })
            .map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">{project.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  카테고리: {project.category} / 진행률: {project.progress}% / 리더:{' '}
                  {project.leaderName ?? '-'}
                </p>
              </Link>
            ))}
      </div>
    </section>
  )
}
