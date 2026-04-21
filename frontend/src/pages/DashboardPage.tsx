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
import { getMyInfo } from '../features/auth/api/authApi'
import { getProjectMembers, getProjects } from '../features/projects/api/projectsApi'
import { getProjectTasks } from '../features/tasks/api/tasksApi'

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#64748b']

export function DashboardPage() {

  const meQuery = useQuery({
    queryKey: ['my-info'],
    queryFn: getMyInfo,
  })

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const role = meQuery.data?.data.role
  const myUserId = meQuery.data?.data.id

  const taskQueries = useQueries({
    queries: (projectsQuery.data?.data ?? []).map((project) => ({
      queryKey: ['tasks', project.id],
      queryFn: () => getProjectTasks(project.id),
      enabled: projectsQuery.isSuccess,
    })),
  })

  const memberQueries = useQueries({
    queries: (projectsQuery.data?.data ?? []).map((project) => ({
      queryKey: ['project-members', project.id],
      queryFn: () => getProjectMembers(project.id),
      enabled: projectsQuery.isSuccess && role === 'LEADER',
    })),
  })

  const projects = projectsQuery.data?.data ?? []
  const allTasks = taskQueries.flatMap((query) => query.data?.data ?? [])
  const myTasks = allTasks.filter((task) => task.assigneeId === myUserId)

  const inProgressProjects = projects.filter(
    (project) => project.status === 'IN_PROGRESS',
  ).length
  const delayedProjects = projects.filter((project) => project.status === 'DELAYED').length
  const thisWeekDeadlineTasks = allTasks.filter((task) => isDueInDays(task.dueDate, task.status, 7))
    .length
  const blockedTasks = allTasks.filter((task) => task.status === 'BLOCKED').length
  const myInProgressTasks = myTasks.filter((task) => task.status === 'IN_PROGRESS').length
  const myDoneTasks = myTasks.filter((task) => task.status === 'DONE').length
  const myDeadlineTasks = myTasks.filter((task) => isDueInDays(task.dueDate, task.status, 7)).length
  const managedTeamMemberCount = new Set(
    memberQueries
      .flatMap((query) => query.data?.data ?? [])
      .map((member) => member.userId)
      .filter((userId) => userId !== myUserId),
  ).size

  const projectStatusDistribution = toDistribution(
    projects.map((project) => project.status),
    'status',
  )
  const taskStatusDistribution = toDistribution(allTasks.map((task) => task.status), 'status')
  const memberTaskData = Object.entries(
    allTasks.reduce<Record<string, number>>((acc, task) => {
      const key = task.assigneeName ?? '미지정'
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {}),
  ).map(([name, count]) => ({ name, count }))
  const myStatusDistribution = toDistribution(myTasks.map((task) => task.status), 'status')
  const myUpcomingTasks = myTasks
    .filter((task) => task.status !== 'DONE' && task.dueDate)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5)

  const dashboardTitle =
    role === 'ADMIN' ? '관리자 대시보드' : role === 'LEADER' ? '팀장 대시보드' : '팀원 대시보드'
  const dashboardDescription =
    role === 'ADMIN'
      ? '전체 프로젝트를 생성/관제하고 전사 현황을 확인합니다.'
      : role === 'LEADER'
        ? '팀 운영 핵심 지표를 확인합니다.'
        : '내 할당 업무의 일정과 진행 상태를 관리합니다.'

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{dashboardTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{dashboardDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {role === 'ADMIN' && (
          <>
            <MetricCard title="전체 프로젝트" value={`${projects.length}`} />
            <MetricCard title="진행 중 프로젝트" value={`${inProgressProjects}`} />
            <MetricCard title="지연 프로젝트" value={`${delayedProjects}`} />
            <MetricCard title="이번 주 마감 업무" value={`${thisWeekDeadlineTasks}`} />
          </>
        )}
        {role === 'LEADER' && (
          <>
            <MetricCard title="내 프로젝트" value={`${projects.length}`} />
            <MetricCard title="관리 팀원" value={`${managedTeamMemberCount}`} />
            <MetricCard title="블로킹 업무" value={`${blockedTasks}`} />
            <MetricCard title="금주 마감" value={`${thisWeekDeadlineTasks}`} />
          </>
        )}
        {role === 'MEMBER' && (
          <>
            <MetricCard title="내 전체 업무" value={`${myTasks.length}`} />
            <MetricCard title="내 진행 중 업무" value={`${myInProgressTasks}`} />
            <MetricCard title="내 완료 업무" value={`${myDoneTasks}`} />
            <MetricCard title="내 이번 주 마감" value={`${myDeadlineTasks}`} />
          </>
        )}
      </div>
      {(role === 'ADMIN' || role === 'LEADER') && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title={role === 'ADMIN' ? '프로젝트 상태 분포' : '업무 상태'}
            data={role === 'ADMIN' ? projectStatusDistribution : taskStatusDistribution}
            dataKey="count"
            nameKey="status"
          />
          <BarCard title="팀원 업무" data={memberTaskData} />
        </div>
      )}

      {role === 'MEMBER' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="내 업무 상태 분포"
            data={myStatusDistribution}
            dataKey="count"
            nameKey="status"
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">내 마감 예정 업무</p>
            <div className="mt-3 space-y-2">
              {myUpcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">
                    상태: {task.status} · 마감일: {task.dueDate}
                  </p>
                </div>
              ))}
              {myUpcomingTasks.length === 0 && (
                <p className="text-sm text-slate-500">예정된 마감 업무가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
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

function ChartCard({
  title,
  data,
  dataKey,
  nameKey,
}: {
  title: string
  data: Array<{ [key: string]: string | number }>
  dataKey: string
  nameKey: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} outerRadius={90} label>
              {data.map((entry, index) => (
                <Cell key={`${entry[nameKey]}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function BarCard({ title, data }: { title: string; data: Array<{ name: string; count: number }> }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function isDueInDays(dueDate: string | null, status: string, days: number) {
  if (!dueDate || status === 'DONE') {
    return false
  }

  const due = new Date(`${dueDate}T00:00:00`)
  const now = new Date()
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

function toDistribution(values: string[], key: string) {
  return Object.entries(
    values.reduce<Record<string, number>>((acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1
      return acc
    }, {}),
  ).map(([name, count]) => ({ [key]: name, count }))
}
