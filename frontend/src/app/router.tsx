import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AuthPage } from '../pages/AuthPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <AuthPage
        title="로그인"
        description="프로젝트 매니저 플랫폼에 로그인해 주세요."
      />
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthPage
        title="회원가입"
        description="학생 프로젝트 관리를 위한 계정을 생성해 주세요."
      />
    ),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '/dashboard',
        element: (
          <PlaceholderPage
            title="대시보드"
            description="프로젝트 현황, 위험 알림, 업무 진행률을 한 화면에서 확인합니다."
          />
        ),
      },
      {
        path: '/projects',
        element: (
          <PlaceholderPage
            title="프로젝트 목록"
            description="프로젝트 생성/조회/필터링 기능의 시작 지점입니다."
          />
        ),
      },
      {
        path: '/projects/:projectId',
        element: (
          <PlaceholderPage
            title="프로젝트 상세"
            description="개요, 업무, 일정, 팀원, 문서, 회의록, 피드백, AI 인사이트 탭을 제공합니다."
          />
        ),
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
          <PlaceholderPage
            title="설정"
            description="프로필, 권한, 알림, 환경 설정을 관리합니다."
          />
        ),
      },
    ],
  },
])

