import { createBrowserRouter } from 'react-router-dom'
import { RootRedirect } from '../features/auth/components/RootRedirect'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { AuthPage } from '../pages/AuthPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProjectAiPage } from '../pages/ProjectAiPage'
import { ProjectCalendarPage } from '../pages/ProjectCalendarPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'
import { ProjectDocumentsPage } from '../pages/ProjectDocumentsPage'
import { ProjectMeetingsPage } from '../pages/ProjectMeetingsPage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { TaskBoardPage } from '../pages/TaskBoardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: (
      <AuthPage
        mode="login"
        title="로그인"
        description="프로젝트 매니저 플랫폼에 로그인해 주세요."
      />
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthPage
        mode="signup"
        title="회원가입"
        description="학생 프로젝트 관리를 위한 계정을 생성해 주세요."
      />
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/projects',
        element: <ProjectsPage />,
      },
      {
        path: '/projects/:projectId',
        element: <ProjectDetailPage />,
      },
      {
        path: '/projects/:projectId/board',
        element: <TaskBoardPage />,
      },
      {
        path: '/projects/:projectId/calendar',
        element: <ProjectCalendarPage />,
      },
      {
        path: '/projects/:projectId/documents',
        element: <ProjectDocumentsPage />,
      },
      {
        path: '/projects/:projectId/meetings',
        element: <ProjectMeetingsPage />,
      },
      {
        path: '/projects/:projectId/ai',
        element: <ProjectAiPage />,
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
