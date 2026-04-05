# PROJECT_PROGRESS.md

## 1. Current Status
- Last Updated: 2026-04-05
- Current Phase: Phase 1 - 기본 세팅
- Current Phase Status: DONE

## 2. Phase Progress
| Phase | Name | Status |
|------|------|------|
| Phase 1 | 기본 세팅 | DONE |
| Phase 2 | 인증 / 권한 | NOT STARTED |
| Phase 3 | 프로젝트 / 팀원 관리 | NOT STARTED |
| Phase 4 | 업무 관리 | NOT STARTED |
| Phase 5 | 일정 / 마일스톤 | NOT STARTED |
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

## 4. Next TODO
- Phase 2 시작 전 결정 필요: 인증/권한 구현 범위 확정(JWT, 역할별 접근 제어)
- `Auth API`(`signup`, `login`, `me`) 설계 및 공통 예외 응답 규격 추가
- 사용자 엔티티/권한(enum) 및 기본 인증 플로우 구현

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
