import { createBrowserRouter } from 'react-router-dom'
import { RootRedirect } from '../features/auth/components/RootRedirect'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { AuthPage } from '../pages/AuthPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

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
        element: (
          <PlaceholderPage
            title="칸반 보드"
            description="Task 상태(TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)를 관리합니다."
          />
        ),
      },
      {
        path: '/projects/:projectId/calendar',
        element: (
          <PlaceholderPage
            title="캘린더"
            description="마일스톤과 일정(회의/발표/제출)을 관리합니다."
          />
        ),
      },
      {
        path: '/projects/:projectId/documents',
        element: (
          <PlaceholderPage
            title="문서"
            description="문서/회의록 CRUD 및 활동 로그 연결을 구현할 영역입니다."
          />
        ),
      },
      {
        path: '/projects/:projectId/meetings',
        element: (
          <PlaceholderPage
            title="회의록"
            description="회의록 작성과 AI 요약 기능을 연동할 영역입니다."
          />
        ),
      },
      {
        path: '/projects/:projectId/ai',
        element: (
          <PlaceholderPage
            title="AI 인사이트"
            description="프로젝트 요약, 위험도 분석, 다음 액션 추천을 제공합니다."
          />
        ),
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
