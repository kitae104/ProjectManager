import { useQueries, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getMyInfo } from '../features/auth/api/authApi'
import {
  getRoleCapability,
  type MenuKey,
} from '../features/auth/constants/roleCapabilities'
import { getUserRoleLabel } from '../features/auth/constants/roleLabels'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import { getProjects } from '../features/projects/api/projectsApi'
import { getProjectTasks } from '../features/tasks/api/tasksApi'
import { useUiStore } from '../store/uiStore'

const navItemsByMenu: Record<MenuKey, { to: string; label: string }> = {
  dashboard: { to: '/dashboard', label: 'Dashboard' },
  projects: { to: '/projects', label: 'Projects' },
  settings: { to: '/settings', label: 'Settings' },
}

export function AppLayout() {
  const navigate = useNavigate()
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const theme = useUiStore((state) => state.theme)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const roleCapability = getRoleCapability(user?.role)
  const navItems = roleCapability.menu.map((menuKey) => navItemsByMenu[menuKey])
  const [notificationOpen, setNotificationOpen] = useState(false)

  const myInfoQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: getMyInfo,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60,
  })

  useEffect(() => {
    if (!accessToken || !myInfoQuery.data?.data) {
      return
    }

    const me = myInfoQuery.data.data
    const isSameUser =
      user?.id === me.id &&
      user?.name === me.name &&
      user?.email === me.email &&
      user?.role === me.role &&
      user?.department === me.department &&
      user?.profileImage === me.profileImage

    if (!isSameUser) {
      setAuth(accessToken, me)
    }
  }, [accessToken, myInfoQuery.data, setAuth, user])

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 1000 * 60,
  })

  const taskQueries = useQueries({
    queries: (projectsQuery.data?.data ?? []).map((project) => ({
      queryKey: ['tasks', project.id],
      queryFn: () => getProjectTasks(project.id),
      staleTime: 1000 * 60,
      enabled: projectsQuery.isSuccess,
    })),
  })

  const notifications = useMemo(() => {
    const today = new Date()
    const items: Array<{ id: string; level: 'warn' | 'danger'; message: string }> = []

    for (const query of taskQueries) {
      if (!query.data?.data) {
        continue
      }

      for (const task of query.data.data) {
        if (user?.role === 'MEMBER' && task.assigneeId !== user.id) {
          continue
        }

        if (task.status === 'BLOCKED') {
          items.push({
            id: `blocked-${task.id}`,
            level: 'danger',
            message: `Blocked task: ${task.title}`,
          })
        }

        if (task.dueDate && task.status !== 'DONE') {
          const dueDate = new Date(`${task.dueDate}T00:00:00`)
          const diffDays = Math.floor(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          )

          if (diffDays < 0) {
            items.push({
              id: `overdue-${task.id}`,
              level: 'danger',
              message: `Overdue: ${task.title} (${task.dueDate})`,
            })
          } else if (diffDays <= 2) {
            items.push({
              id: `due-soon-${task.id}`,
              level: 'warn',
              message: `Due soon: ${task.title} (${task.dueDate})`,
            })
          }
        }
      }
    }

    return items.slice(0, 12)
  }, [taskQueries])

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`min-h-screen text-slate-800 ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside
          className={`border-r border-slate-200 bg-white transition-all ${
            sidebarCollapsed ? 'w-[84px]' : 'w-[240px]'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <span className="text-sm font-bold text-blue-900">
              {sidebarCollapsed ? 'PM' : 'PROJECT MANAGER'}
            </span>
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              {sidebarCollapsed ? '>' : '<'}
            </button>
          </div>

          <nav className="space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {sidebarCollapsed ? item.label.slice(0, 2) : item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Student Project Management
              </p>
              <h1 className="text-base font-semibold text-slate-900">Project Manager</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Alerts {notifications.length > 0 ? `(${notifications.length})` : ''}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-xs font-semibold text-slate-500">Recent alerts</p>
                    <div className="mt-2 max-h-72 space-y-2 overflow-auto">
                      {notifications.length === 0 && (
                        <p className="text-sm text-slate-500">No pending alerts.</p>
                      )}
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`rounded-lg px-3 py-2 text-xs ${
                            notification.level === 'danger'
                              ? 'border border-red-200 bg-red-50 text-red-700'
                              : 'border border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {notification.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{getUserRoleLabel(user?.role)}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
