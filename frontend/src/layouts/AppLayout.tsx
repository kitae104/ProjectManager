import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/useAuthStore'
import { useUiStore } from '../store/uiStore'

const navItems = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/projects', label: '프로젝트' },
  { to: '/settings', label: '설정' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
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
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
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
              <h1 className="text-base font-semibold text-slate-900">
                프로젝트 관리 플랫폼
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                Phase 3
              </span>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                로그아웃
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
