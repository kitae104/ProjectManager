import { getMyInfo } from '../features/auth/api/authApi'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getHealth } from '../features/health/api/getHealth'
import { getProjects } from '../features/projects/api/projectsApi'
import { getProjectTasks } from '../features/tasks/api/tasksApi'
import { getUserRoleLabel } from '../features/auth/constants/roleLabels'

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#64748b']

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ['health-check'],
    queryFn: getHealth,
  })

  const meQuery = useQuery({
    queryKey: ['my-info'],
    queryFn: getMyInfo,
  })

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const taskQueries = useQueries({
    queries: (projectsQuery.data?.data ?? []).map((project) => ({
      queryKey: ['tasks', project.id],
      queryFn: () => getProjectTasks(project.id),
      enabled: projectsQuery.isSuccess,
    })),
  })

  const projects = projectsQuery.data?.data ?? []
  const allTasks = taskQueries.flatMap((query) => query.data?.data ?? [])
  const inProgressProjects = projects.filter(
    (project) => project.status === 'IN_PROGRESS',
  ).length
  const delayedProjects = projects.filter(
    (project) => project.status === 'DELAYED',
  ).length
  const thisWeekDeadlineTasks = allTasks.filter((task) => {
    if (!task.dueDate || task.status === 'DONE') {
      return false
    }
    const dueDate = new Date(`${task.dueDate}T00:00:00`)
    const now = new Date()
    const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  }).length

  const statusDistribution = Object.entries(
    projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1
      return acc
    }, {}),
  ).map(([status, count]) => ({ status, count }))

  const memberTaskData = Object.entries(
    allTasks.reduce<Record<string, number>>((acc, task) => {
      const key = task.assigneeName ?? '미지정'
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {}),
  ).map(([name, count]) => ({ name, count }))

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">대시보드</h2>
        <p className="mt-2 text-sm text-slate-600">
          인증 상태와 백엔드 연결 상태를 확인합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="전체 프로젝트" value={`${projects.length}`} />
        <MetricCard title="진행 중 프로젝트" value={`${inProgressProjects}`} />
        <MetricCard title="지연 프로젝트" value={`${delayedProjects}`} />
        <MetricCard title="이번 주 마감 업무" value={`${thisWeekDeadlineTasks}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Backend Health
          </p>
          {healthQuery.isLoading && (
            <p className="mt-2 text-sm text-slate-600">헬스체크 조회 중...</p>
          )}
          {healthQuery.isError && (
            <p className="mt-2 text-sm text-red-600">
              백엔드 연결에 실패했습니다. `VITE_API_BASE_URL` 또는 서버 실행 상태를
              확인해 주세요.
            </p>
          )}
          {healthQuery.isSuccess && (
            <div className="mt-2 text-sm text-slate-700">
              <p>
                상태:{' '}
                <span className="font-semibold text-emerald-600">
                  {healthQuery.data.data.status}
                </span>
              </p>
              <p>서비스: {healthQuery.data.data.service}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Auth / Me API
          </p>
          {meQuery.isLoading && (
            <p className="mt-2 text-sm text-slate-600">내 정보 조회 중...</p>
          )}
          {meQuery.isError && (
            <p className="mt-2 text-sm text-red-600">
              인증 정보가 유효하지 않습니다. 다시 로그인해 주세요.
            </p>
          )}
          {meQuery.isSuccess && (
            <div className="mt-2 text-sm text-slate-700">
              <p>이름: {meQuery.data.data.name}</p>
              <p>이메일: {meQuery.data.data.email}</p>
              <p>역할: {getUserRoleLabel(meQuery.data.data.role)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">프로젝트 상태 분포</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={90}
                  label
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">팀원별 업무 분포</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberTaskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
