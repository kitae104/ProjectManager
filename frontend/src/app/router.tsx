import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootRedirect } from '../features/auth/components/RootRedirect'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { PlaceholderPage } from '../pages/PlaceholderPage'

const AppLayout = lazy(() =>
  import('../layouts/AppLayout').then((module) => ({ default: module.AppLayout })),
)
const AuthPage = lazy(() =>
  import('../pages/AuthPage').then((module) => ({ default: module.AuthPage })),
)
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const ProjectAiPage = lazy(() =>
  import('../pages/ProjectAiPage').then((module) => ({ default: module.ProjectAiPage })),
)
const ProjectCalendarPage = lazy(() =>
  import('../pages/ProjectCalendarPage').then((module) => ({
    default: module.ProjectCalendarPage,
  })),
)
const ProjectDetailPage = lazy(() =>
  import('../pages/ProjectDetailPage').then((module) => ({
    default: module.ProjectDetailPage,
  })),
)
const ProjectDocumentsPage = lazy(() =>
  import('../pages/ProjectDocumentsPage').then((module) => ({
    default: module.ProjectDocumentsPage,
  })),
)
const ProjectMeetingsPage = lazy(() =>
  import('../pages/ProjectMeetingsPage').then((module) => ({
    default: module.ProjectMeetingsPage,
  })),
)
const ProjectsPage = lazy(() =>
  import('../pages/ProjectsPage').then((module) => ({ default: module.ProjectsPage })),
)
const TaskBoardPage = lazy(() =>
  import('../pages/TaskBoardPage').then((module) => ({ default: module.TaskBoardPage })),
)

function withPageFallback(element: ReactNode) {
  return (
    <Suspense
      fallback={
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">페이지를 불러오는 중입니다...</p>
        </section>
      }
    >
      {element}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: withPageFallback(
      <AuthPage
        mode="login"
        title="로그인"
        description="프로젝트 매니저 플랫폼에 로그인해 주세요."
      />,
    ),
  },
  {
    path: '/signup',
    element: withPageFallback(
      <AuthPage
        mode="signup"
        title="회원가입"
        description="학생 프로젝트 관리를 위한 계정을 생성해 주세요."
      />,
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        {withPageFallback(<AppLayout />)}
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: withPageFallback(<DashboardPage />),
      },
      {
        path: '/projects',
        element: withPageFallback(<ProjectsPage />),
      },
      {
        path: '/projects/:projectId',
        element: withPageFallback(<ProjectDetailPage />),
      },
      {
        path: '/projects/:projectId/board',
        element: withPageFallback(<TaskBoardPage />),
      },
      {
        path: '/projects/:projectId/calendar',
        element: withPageFallback(<ProjectCalendarPage />),
      },
      {
        path: '/projects/:projectId/documents',
        element: withPageFallback(<ProjectDocumentsPage />),
      },
      {
        path: '/projects/:projectId/meetings',
        element: withPageFallback(<ProjectMeetingsPage />),
      },
      {
        path: '/projects/:projectId/ai',
        element: withPageFallback(<ProjectAiPage />),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            <PlaceholderPage
              title="설정"
              description="관리자 권한이 필요한 설정 페이지입니다."
            />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
