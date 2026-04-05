import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import {
  createProject,
  getProjects,
} from '../features/projects/api/projectsApi'
import type {
  ProjectCategory,
  ProjectCreateRequest,
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

export function ProjectsPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [semester, setSemester] = useState('2026-1')
  const [category, setCategory] = useState<ProjectCategory>('DEVELOPMENT')
  const [status, setStatus] = useState<ProjectStatus>('PLANNING')

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

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
        <h2 className="text-xl font-bold text-slate-900">프로젝트 목록</h2>
        <p className="mt-1 text-sm text-slate-600">
          프로젝트를 생성하고 상세 페이지에서 팀원을 관리할 수 있습니다.
        </p>
      </div>

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

      <div className="grid gap-4">
        {projectsQuery.isLoading && (
          <p className="text-sm text-slate-500">프로젝트 목록을 불러오는 중입니다.</p>
        )}
        {projectsQuery.isSuccess &&
          projectsQuery.data.data.map((project) => (
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
                카테고리: {project.category} · 진행률: {project.progress}% · 리더:{' '}
                {project.leaderName ?? '-'}
              </p>
            </Link>
          ))}
      </div>
    </section>
  )
}
