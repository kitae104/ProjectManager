# PROJECT_PROGRESS.md

## 1. Current Status
- Last Updated: 2026-04-06
- Current Phase: Phase 5 - 일정 / 마일스톤
- Current Phase Status: DONE

## 2. Phase Progress
| Phase | Name | Status |
|------|------|------|
| Phase 1 | 기본 세팅 | DONE |
| Phase 2 | 인증 / 권한 | DONE |
| Phase 3 | 프로젝트 / 팀원 관리 | DONE |
| Phase 4 | 업무 관리 | DONE |
| Phase 5 | 일정 / 마일스톤 | DONE |
| Phase 6 | 문서 / 회의록 | NOT STARTED |
| Phase 7 | AI 기능 | NOT STARTED |
| Phase 8 | 고도화 | NOT STARTED |

## 3. Completed Work
- `PROJECT_MANAGEMENT_PRD.md` 전체 검토 완료
- 프로젝트 진행 상태 추적 파일(`PROJECT_PROGRESS.md`) 초기화 완료
- `backend`, `frontend` 분리 구조 생성 완료
- 백엔드 Spring Boot(Gradle Wrapper) 초기화 완료
- 프론트엔드 React + Vite + TypeScript 초기화 완료
- 공통 코드 스타일 설정 파일(`.editorconfig`) 추가
- 프론트 핵심 라이브러리 설치 완료
  - `react-router-dom`, `zustand`, `@tanstack/react-query`, `axios`
  - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`
  - `recharts`, `echarts`, `tailwindcss`, `@tailwindcss/vite`
- 백엔드 최소 Phase 1 API 준비 완료
  - `application.yml` 추가
  - 공통 응답 포맷 `ApiResponse` 추가
  - 헬스체크 API `GET /api/health` 추가
  - CORS + 보안 기본 설정(`SecurityConfig`) 추가
- 프론트/백엔드 연결 준비 완료
  - `frontend/.env.example` 및 `backend/.env.example` 추가
  - 대시보드에서 헬스체크 API 호출 확인 코드 추가
- 검증 완료
  - `backend`: `./gradlew.bat test` 통과
  - `frontend`: `npm run build` 통과
- Phase 2 인증/권한 구현 완료
  - JWT 발급/검증(`JwtTokenProvider`, `JwtAuthenticationFilter`) 추가
  - Auth API 구현
    - `POST /api/auth/signup`
    - `POST /api/auth/login`
    - `GET /api/auth/me`
  - User API 구현
    - `GET /api/users/me` (인증 사용자)
    - `GET /api/users`, `GET /api/users/{id}` (ADMIN 권한)
  - 사용자 도메인 추가(`User`, `UserRole`, `UserRepository`)
  - 공통 예외 처리(`GlobalExceptionHandler`) 및 실패 응답 포맷 적용
  - 프론트 인증 플로우 구현
    - 로그인/회원가입 폼 API 연동
    - 토큰/사용자 상태 저장(Zustand persist)
    - 인증 라우트 보호(`ProtectedRoute`)
    - 역할 기반 라우트 보호(`/settings` 관리자 전용)
  - 인증 환경변수 템플릿 추가
    - `JWT_SECRET`
    - `JWT_ACCESS_TOKEN_EXPIRATION_SECONDS`
- Phase 3 프로젝트/팀원 관리 구현 완료
  - 프로젝트 도메인 추가
    - `Project`, `ProjectCategory`, `ProjectStatus`
    - `ProjectMember`, `ProjectMemberRole`
  - 프로젝트 API 구현
    - `GET /api/projects`
    - `POST /api/projects`
    - `GET /api/projects/{id}`
    - `PUT /api/projects/{id}`
    - `DELETE /api/projects/{id}`
  - 프로젝트 팀원 API 구현
    - `GET /api/projects/{id}/members`
    - `POST /api/projects/{id}/members`
    - `DELETE /api/projects/{id}/members/{memberId}`
  - 프론트 프로젝트 페이지 연동
    - `/projects`: 프로젝트 목록/생성
    - `/projects/:projectId`: 프로젝트 수정/삭제, 팀원 추가/제거
  - 검증 완료
    - `backend`: `./gradlew.bat test` 통과
    - `frontend`: `npm run build` 통과
- Phase 4 업무(Task) 관리 구현 완료
  - 업무 도메인 추가
    - `Task`, `TaskStatus`, `TaskPriority`, `TaskRepository`
  - 업무 API 구현
    - `GET /api/projects/{id}/tasks`
    - `POST /api/projects/{id}/tasks`
    - `GET /api/tasks/{taskId}`
    - `PUT /api/tasks/{taskId}`
    - `DELETE /api/tasks/{taskId}`
    - `PATCH /api/tasks/{taskId}/status`
  - 프로젝트 삭제 시 연관 Task 정리 로직 추가
    - `ProjectService`에서 `taskRepository.deleteByProjectId(projectId)` 처리
  - 프론트 칸반 보드 연동 완료
    - `/projects/:projectId/board` 라우트 연결
    - Task CRUD 폼 + 상태 드래그앤드롭 변경
    - 프로젝트 상세 페이지에서 보드 이동 버튼 추가
  - 검증 완료
    - `backend`: `./gradlew.bat test` 통과
    - `frontend`: `npm run build` 통과
- Phase 5 일정/마일스톤 관리 구현 완료
  - 마일스톤 도메인/API 구현
    - `Milestone`, `MilestoneStatus`, `MilestoneRepository`
    - `GET /api/projects/{id}/milestones`
    - `POST /api/projects/{id}/milestones`
    - `PUT /api/milestones/{milestoneId}`
    - `DELETE /api/milestones/{milestoneId}`
  - 일정 도메인/API 구현
    - `Schedule`, `ScheduleType`, `ScheduleRepository`
    - `GET /api/projects/{id}/schedules`
    - `POST /api/projects/{id}/schedules`
    - `PUT /api/schedules/{scheduleId}`
    - `DELETE /api/schedules/{scheduleId}`
  - 프로젝트 삭제 시 연관 milestone/schedule 정리 로직 추가
  - 프론트 캘린더 페이지 연동 완료
    - `/projects/:projectId/calendar` 라우트 연결
    - 주간/월간 기준 필터 UI
    - 마일스톤/일정 CRUD 폼 및 목록 연동
  - 검증 완료
    - `backend`: `./gradlew.bat test` 통과
    - `frontend`: `npm run build` 통과

## 4. Next TODO
- Phase 6 시작: 문서 / 회의록 도메인 설계
- 문서 CRUD API 구현
- 회의록 CRUD API 구현
- `/projects/:projectId/documents`, `/projects/:projectId/meetings` UI/API 연동
- 활동 로그(ActivityLog) 기본 연동 준비

## 5. Run Notes
- 로컬 실행 기반(비컨테이너) 개발 원칙 준수
- Docker, Docker Compose, Nginx 설정 파일 생성 금지
- Backend 실행:
  - `cd backend`
  - `./gradlew.bat bootRun`
- Frontend 실행:
  - `cd frontend`
  - `npm install`
  - `npm run dev`
- 연결 확인:
  - Backend: `http://localhost:8080/api/health`
  - Frontend: `http://localhost:5173/dashboard`
- 인증 API 확인:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (`Authorization: Bearer {token}`)
- 프로젝트 API 확인:
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/projects/{id}`
  - `PUT /api/projects/{id}`
  - `DELETE /api/projects/{id}`
  - `GET /api/projects/{id}/members`
  - `POST /api/projects/{id}/members`
  - `DELETE /api/projects/{id}/members/{memberId}`
- Task API 확인:
  - `GET /api/projects/{id}/tasks`
  - `POST /api/projects/{id}/tasks`
  - `GET /api/tasks/{taskId}`
  - `PUT /api/tasks/{taskId}`
  - `DELETE /api/tasks/{taskId}`
  - `PATCH /api/tasks/{taskId}/status`
- Milestone API 확인:
  - `GET /api/projects/{id}/milestones`
  - `POST /api/projects/{id}/milestones`
  - `PUT /api/milestones/{milestoneId}`
  - `DELETE /api/milestones/{milestoneId}`
- Schedule API 확인:
  - `GET /api/projects/{id}/schedules`
  - `POST /api/projects/{id}/schedules`
  - `PUT /api/schedules/{scheduleId}`
  - `DELETE /api/schedules/{scheduleId}`
