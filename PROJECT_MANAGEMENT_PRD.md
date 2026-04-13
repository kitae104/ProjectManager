# PROJECT_MANAGEMENT_PRD.md

## 1. 프로젝트 개요

### 프로젝트명
학생 프로젝트 관리 플랫폼

### 프로젝트 목적
캡스톤, 창업, AI, 개발 프로젝트를 수행하는 학생 팀이
프로젝트 일정, 업무, 팀원 역할, 진행 상태, 문서, 회의록, 산출물, 피드백을
한 곳에서 관리할 수 있는 웹 기반 프로젝트 관리 플랫폼을 구축한다.

### 핵심 컨셉
이 서비스는 다음 4가지 스타일을 결합한 형태로 설계한다.

- Linear 스타일의 세련되고 빠른 UI
- Jira식 업무/이슈/상태 관리
- Notion식 문서/회의록/프로젝트 정보 정리
- Spring AI 기반 요약, 추천, 위험 분석, 보고서 생성 기능

### 주요 사용자
- 관리자(Admin)
- 팀장(Leader)
- 팀원(Member)


---

## 2. 기술 스택

### Backend
- Java 21 이상
- Spring Boot 4.x
- Spring Security
- JWT Authentication
- Spring Data JPA
- Spring Validation
- Lombok
- MySQL
- Spring AI
- OpenAPI / Swagger

### Frontend
- React 19
- Vite 8
- SWC
- Tailwind CSS 4
- React Router
- Zustand
- TanStack Query
- Axios
- dnd-kit (칸반 드래그앤드롭)
- Recharts 또는 ECharts

### DevOps / Infra 
- Docker 사용하지 않음
- Docker Compose 사용하지 않음
- Nginx 기반 구성 제외 (초기 개발 단계)
- GitHub Actions (선택)
- Ubuntu Server (선택)

### 실행 환경 (중요)

이 프로젝트는 컨테이너 기반이 아닌 **로컬 실행 기반 개발 환경**을 사용한다.

- Backend: Spring Boot 직접 실행
- Frontend: Vite Dev Server 실행
- Database: 로컬 MySQL 직접 연결

### 실행 방식

#### Backend
- IntelliJ 또는 VS Code에서 직접 실행
- 또는:
```bash
./gradlew bootRun
```

#### Frontend
- Vite 개발 서버 실행
```bash
cd frontend
npm install
npm run dev
```

---

## 3. 개발 목표

### 1차 목표 (MVP)
다음 기능이 동작하는 수준까지 구현한다.

- 회원가입 / 로그인 / JWT 인증
- 프로젝트 생성 / 조회 / 수정 / 삭제
- 프로젝트별 팀원 관리
- 역할 및 담당 영역 관리
- 업무(Task) 생성 / 수정 / 상태 변경
- 칸반 보드
- 마일스톤 및 일정 관리
- 문서 / 회의록 관리
- 활동 로그
- 진행률 시각화
- AI 기반 요약 / 추천 기능 일부 구현

### 2차 목표
- 교수/멘토 피드백 기능
- 프로젝트 위험도 분석
- 주간보고 자동 생성
- 발표 준비 체크리스트 생성
- 파일 첨부 및 산출물 관리
- 알림 기능

### 3차 목표
- GitHub 연동
- Google Calendar 연동
- 팀별 AI 어시스턴트
- 프로젝트 템플릿 기능
- 평가 및 점수 관리 기능

---

## 4. 디자인 방향

### 디자인 키워드
- modern
- minimal
- professional
- educational
- dashboard-centric
- collaborative
- high readability

### UI 방향
- 좌측 사이드바 + 상단 헤더 + 메인 컨텐츠 구조
- 카드형 대시보드
- 리스트/보드/캘린더/타임라인 뷰 지원
- 상태 배지, 진행률 바, 아바타 스택 적극 활용
- 여백이 넉넉하고 가독성이 높은 레이아웃
- 라이트/다크 모드 지원
- 모바일보다 데스크톱 우선 반응형 설계

### 벤치마킹 스타일
- Linear: 전체적인 미니멀 UI, 빠른 탐색 경험
- Jira: 상태 기반 업무 관리, 보드/이슈 흐름
- Notion: 문서/회의록/프로젝트 정보 정리 구조
- Slack/Discord 일부: 최근 활동 로그와 협업 느낌

### 컬러 방향
- Primary: Indigo / Blue 계열
- Success: Green
- Warning: Orange
- Danger: Red
- Neutral: Gray / Zinc 기반
- Background: 매우 연한 Gray 또는 Zinc 계열

---

## 5. 핵심 기능 정의

## 5-1. 인증 / 사용자 관리
### 기능
- 회원가입
- 로그인
- JWT 기반 인증
- 내 정보 조회 / 수정
- 권한(Role) 기반 접근 제어

### 권한
- ADMIN
- LEADER
- MEMBER

---

## 5-2. 프로젝트 관리
### 기능
- 프로젝트 생성
- 프로젝트 목록 조회
- 프로젝트 상세 조회
- 프로젝트 수정 / 삭제
- 프로젝트 상태 관리

### 새 프로젝트 생성: 권한별 사용 예시

#### ADMIN
- 목적: 학기/트랙 운영 관점에서 공식 프로젝트를 먼저 등록
- 예시:
  - 제목: `2026-1 캡스톤 공통 운영`
  - 카테고리: `CAPSTONE`
  - 상태: `PLANNING`
  - 설명: 학기 공통 공지, 평가 일정, 운영 체크리스트를 관리하는 프로젝트
- 사용 포인트:
  - 초기에 리더(leaderId) 지정
  - 팀별 프로젝트 생성 기준(카테고리/네이밍 규칙) 제시
  - 기존 `MENTOR`/`PROFESSOR`가 담당하던 운영·검토 책임을 포함해 수행

#### LEADER
- 목적: 실제 팀 프로젝트 생성 및 팀 운영 시작
- 예시:
  - 제목: `AI 회의록 자동화 플랫폼`
  - 카테고리: `AI`
  - 상태: `PLANNING` 또는 `IN_PROGRESS`
  - 설명: 팀 목표, MVP 범위, 주요 마일스톤을 포함해 등록
- 사용 포인트:
  - 생성 직후 팀원 초대 및 역할 배정
  - 기본 보드/캘린더/문서 탭 즉시 세팅

#### MEMBER
- 목적: 팀 내 세부 과제/실험성 서브 프로젝트 제안 및 실행
- 예시:
  - 제목: `추천 모델 성능 개선 실험`
  - 카테고리: `DEVELOPMENT`
  - 상태: `PLANNING`
  - 설명: 본 프로젝트와의 연계, 종료 기준, 산출물 명시
- 사용 포인트:
  - 리더와 목표/범위를 먼저 정렬한 뒤 생성
  - 중복 프로젝트 난립 방지를 위해 명확한 범위 작성

### 프로젝트 카테고리
- CAPSTONE
- STARTUP
- AI
- DEVELOPMENT
- ETC

### 프로젝트 상태
- PLANNING
- IN_PROGRESS
- REVIEW
- COMPLETED
- ON_HOLD
- DELAYED

### 프로젝트 상세 탭
- 개요
- 업무
- 일정
- 팀원
- 문서
- 회의록
- 피드백
- 활동 로그
- AI 인사이트

---

## 5-3. 팀원 / 역할 관리
### 기능
- 프로젝트에 팀원 추가 / 제거
- 프로젝트 내 역할 지정
- 담당 분야 지정
- 책임 영역 작성

### 프로젝트 내 역할 예시
- LEADER
- FRONTEND
- BACKEND
- AI
- DESIGN
- PM
- DOCS
- 발표 담당

---

## 5-4. 업무(Task) 관리
### 기능
- 업무 생성 / 수정 / 삭제
- 담당자 지정
- 우선순위 지정
- 시작일 / 마감일 지정
- 상태 변경
- 코멘트 기록
- 업무 진행률 표시

### 업무 상태
- TODO
- IN_PROGRESS
- IN_REVIEW
- DONE
- BLOCKED

### 우선순위
- LOW
- MEDIUM
- HIGH
- URGENT

### 보기 방식
- 리스트 뷰
- 칸반 보드 뷰
- 담당자별 보기
- 마감일 기준 보기

---

## 5-5. 일정 / 마일스톤 관리
### 기능
- 마일스톤 생성 / 수정 / 삭제
- 프로젝트 캘린더
- 주간 / 월간 일정 보기
- 발표일 / 점검일 / 제출일 관리

### 일정 종류 예시
- 회의
- 발표
- 제출
- 시연
- 멘토링
- 내부 점검

---

## 5-6. 문서 / 회의록 관리
### 기능
- 문서 생성 / 수정 / 삭제
- 회의록 작성
- 프로젝트 관련 메모 저장
- 버전 정보 기록
- AI 요약 버튼

### 문서 타입
- 프로젝트 개요
- 제안서
- 회의록
- 주간 보고서
- 기술 문서
- 발표 준비 문서
- 회고

### 회의록 기본 템플릿 항목
- 회의 제목
- 회의 일시
- 참석자
- 주요 논의 내용
- 결정 사항
- 다음 액션 아이템
- 작성자

---

## 5-7. 활동 로그
### 기능
- 프로젝트 생성 기록
- 업무 상태 변경 기록
- 문서 수정 기록
- 팀원 추가/제거 기록
- AI 분석 생성 기록

### 예시 로그
- "김OO이 업무 상태를 TODO → IN_PROGRESS로 변경"
- "이OO이 회의록을 작성"
- "박OO이 마일스톤을 수정"

---

## 5-8. AI 인사이트 기능
### 목표
Spring AI를 활용하여 프로젝트 상태를 해석하고,
학생 팀이 다음 액션을 더 쉽게 결정할 수 있도록 돕는다.

### MVP AI 기능
1. 프로젝트 요약 생성
2. 회의록 요약
3. 다음 할 일 추천
4. 지연 위험 분석
5. 주간 보고 초안 생성

### AI 기능 상세

#### A. 프로젝트 요약
입력:
- 프로젝트 설명
- 현재 업무 목록
- 최근 활동 로그
- 회의록 요약

출력:
- 현재 진행 상황 요약
- 핵심 이슈
- 다음 주 핵심 작업

#### B. 회의록 요약
입력:
- 회의록 전체 내용

출력:
- 3줄 요약
- 결정 사항
- 액션 아이템
- 담당자 추정

#### C. 다음 할 일 추천
입력:
- 미완료 업무
- 마감일
- 현재 상태
- 진행률

출력:
- 우선순위가 높은 다음 업무 3~5개
- 이유

#### D. 지연 위험 분석
입력:
- 프로젝트 진행률
- 마감일까지 남은 기간
- 완료되지 않은 작업 수
- 최근 활동 빈도

출력:
- 위험도 (LOW / MEDIUM / HIGH)
- 지연 가능 원인
- 대응 방안

#### E. 주간 보고 초안 생성
입력:
- 이번 주 완료 업무
- 진행 중 업무
- 문제점
- 다음 주 계획

출력:
- 교수 제출용 주간 보고서 초안

---

## 5-9. 설정(Settings)
### 목표
사용자/운영자 관점에서 서비스 공통 동작을 제어하고,
권한별 작업 방식이 안정적으로 유지되도록 설정 기능을 제공한다.

### 공통 설정(모든 로그인 사용자)
- 프로필 설정
  - 이름, 소속(학과/부서), 프로필 이미지
- 알림 설정
  - 마감 임박 알림 on/off
  - 블로킹 업무 알림 on/off
  - 회의 일정 알림 on/off
- 화면 설정
  - 라이트/다크 모드
  - 사이드바 기본 펼침/접힘
- 보안 설정
  - 비밀번호 변경
  - 토큰 만료 시 재로그인 정책 안내

### 프로젝트 기본 설정(LEADER 이상)
- 새 프로젝트 기본값
  - 기본 카테고리
  - 기본 상태
  - 기본 템플릿(설명/문서 초안)
- 팀 운영 기본 규칙
  - 역할 자동 제안
  - 마일스톤 기본 구조

### 운영 설정(ADMIN 전용)
- 사용자/권한 정책
  - 역할 변경 정책
  - 역할 체계 운영 기준(`ADMIN`/`LEADER`/`MEMBER`)
- 시스템 정책
  - 기본 CORS/보안 정책(운영 환경 기준)
  - 파일 업로드 제한 용량
  - 학기 기본값 및 프로젝트 네이밍 규칙

### 설정 페이지 구성안
- `/settings/profile`
- `/settings/notifications`
- `/settings/display`
- `/settings/security`
- `/settings/project-defaults` (LEADER 이상)
- `/settings/admin` (ADMIN 전용)

### 설정 API 설계 방향(초안)
- `GET /api/settings/me`
- `PUT /api/settings/me`
- `PUT /api/settings/password`
- `GET /api/settings/notifications`
- `PUT /api/settings/notifications`
- `GET /api/settings/display`
- `PUT /api/settings/display`
- `GET /api/settings/project-defaults` (LEADER 이상)
- `PUT /api/settings/project-defaults` (LEADER 이상)
- `GET /api/settings/admin` (ADMIN)
- `PUT /api/settings/admin` (ADMIN)

---

## 6. DB 설계 방향

### 핵심 테이블
- users
- projects
- project_members
- tasks
- task_comments
- milestones
- schedules
- documents
- meeting_notes
- feedbacks
- activity_logs
- ai_insights

### 공통 컬럼 규칙
모든 주요 테이블에는 가능하면 아래 컬럼을 포함한다.

- id
- created_at
- updated_at
- created_by
- updated_by
- deleted_at (소프트 삭제 필요 시)

### 기본 설계 원칙
- 상태값은 Enum 사용
- 외래키 명확하게 구성
- created_at / updated_at 기본 관리
- 문서/로그/회의록은 프로젝트 기준으로 연결
- 담당자/작성자/수정자 구분 명확히 유지

---

## 7. 엔티티 초안

## User
- id
- name
- email
- password
- role
- department
- profile_image
- created_at
- updated_at

## Project
- id
- title
- description
- category
- status
- semester
- start_date
- end_date
- progress
- leader_id
- created_at
- updated_at

## ProjectMember
- id
- project_id
- user_id
- project_role
- responsibility
- joined_at

## Task
- id
- project_id
- title
- description
- status
- priority
- assignee_id
- reporter_id
- start_date
- due_date
- progress
- created_at
- updated_at

## TaskComment
- id
- task_id
- author_id
- content
- created_at

## Milestone
- id
- project_id
- title
- description
- due_date
- status
- created_at
- updated_at

## Schedule
- id
- project_id
- title
- description
- schedule_type
- start_datetime
- end_datetime
- location
- created_at
- updated_at

## Document
- id
- project_id
- title
- type
- content
- version
- author_id
- created_at
- updated_at

## MeetingNote
- id
- project_id
- title
- meeting_datetime
- attendees
- content
- summary
- author_id
- created_at
- updated_at

## Feedback
- id
- project_id
- author_id
- target_type
- target_id
- content
- score
- created_at

## ActivityLog
- id
- project_id
- actor_id
- action_type
- target_type
- target_id
- message
- created_at

## AIInsight
- id
- project_id
- insight_type
- content
- risk_level
- created_at

---

## 8. API 설계 방향

### Auth API
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### User API
- GET /api/users/me
- PUT /api/users/me
- GET /api/users
- GET /api/users/{id}

### Project API
- GET /api/projects
- POST /api/projects
- GET /api/projects/{id}
- PUT /api/projects/{id}
- DELETE /api/projects/{id}

### Project Member API
- GET /api/projects/{id}/members
- POST /api/projects/{id}/members
- DELETE /api/projects/{id}/members/{memberId}

### Task API
- GET /api/projects/{id}/tasks
- POST /api/projects/{id}/tasks
- GET /api/tasks/{taskId}
- PUT /api/tasks/{taskId}
- DELETE /api/tasks/{taskId}
- PATCH /api/tasks/{taskId}/status

### Milestone API
- GET /api/projects/{id}/milestones
- POST /api/projects/{id}/milestones
- PUT /api/milestones/{milestoneId}
- DELETE /api/milestones/{milestoneId}

### Schedule API
- GET /api/projects/{id}/schedules
- POST /api/projects/{id}/schedules
- PUT /api/schedules/{scheduleId}
- DELETE /api/schedules/{scheduleId}

### Document API
- GET /api/projects/{id}/documents
- POST /api/projects/{id}/documents
- GET /api/documents/{documentId}
- PUT /api/documents/{documentId}
- DELETE /api/documents/{documentId}

### Meeting Note API
- GET /api/projects/{id}/meeting-notes
- POST /api/projects/{id}/meeting-notes
- GET /api/meeting-notes/{id}
- PUT /api/meeting-notes/{id}
- DELETE /api/meeting-notes/{id}

### Feedback API
- GET /api/projects/{id}/feedbacks
- POST /api/projects/{id}/feedbacks

### Activity Log API
- GET /api/projects/{id}/activities

### AI API
- POST /api/projects/{id}/ai/summary
- POST /api/projects/{id}/ai/risk-analysis
- POST /api/meeting-notes/{id}/ai/summary
- POST /api/projects/{id}/ai/weekly-report
- POST /api/projects/{id}/ai/next-actions

### Settings API (Plan)
- GET /api/settings/me
- PUT /api/settings/me
- PUT /api/settings/password
- GET /api/settings/notifications
- PUT /api/settings/notifications
- GET /api/settings/display
- PUT /api/settings/display
- GET /api/settings/project-defaults
- PUT /api/settings/project-defaults
- GET /api/settings/admin
- PUT /api/settings/admin

---

## 9. 프론트엔드 구조 제안

### 디렉토리 구조 예시
src/
  app/
  assets/
  components/
    common/
    dashboard/
    project/
    task/
    meeting/
    ai/
  features/
    auth/
    users/
    projects/
    tasks/
    milestones/
    schedules/
    documents/
    meetings/
    feedbacks/
    ai/
  layouts/
  pages/
  routes/
  services/
  store/
  hooks/
  lib/
  utils/
  types/

### 주요 페이지
- /login
- /signup
- /dashboard
- /projects
- /projects/:projectId
- /projects/:projectId/board
- /projects/:projectId/calendar
- /projects/:projectId/documents
- /projects/:projectId/meetings
- /projects/:projectId/ai
- /settings

### 프로젝트 상세 탭
- Overview
- Board
- Calendar
- Members
- Documents
- Meetings
- Feedback
- AI Insights

---

## 10. 대시보드 구성

### 메인 대시보드 카드
- 전체 프로젝트 수
- 진행 중 프로젝트 수
- 지연 프로젝트 수
- 이번 주 마감 업무 수
- 최근 활동
- 위험 프로젝트 알림
- 내 업무 현황

### 시각화 요소
- 프로젝트 상태 분포 차트
- 마감일 임박 업무 리스트
- 팀원별 업무 분배 현황
- 프로젝트 진행률 카드

---

## 11. 구현 우선순위

## Phase 1. 기본 세팅
- 백엔드 프로젝트 생성
- 프론트엔드 프로젝트 생성
- 공통 코드 스타일 설정
- 환경 변수 정리
- 기본 레이아웃 구성

## Phase 2. 인증 / 권한
- JWT 인증
- 로그인 / 회원가입
- 권한별 라우트 보호
- 사용자 정보 API

## Phase 3. 프로젝트 / 팀원 관리
- 프로젝트 CRUD
- 프로젝트 목록 / 상세
- 팀원 추가 / 삭제 / 역할 지정

## Phase 4. 업무 관리
- Task CRUD
- 상태 변경
- 칸반 보드
- 우선순위, 담당자, 마감일

## Phase 5. 일정 / 마일스톤
- 캘린더 UI
- 마일스톤 관리
- 주요 일정 관리

## Phase 6. 문서 / 회의록
- 문서 CRUD
- 회의록 CRUD
- 문서/회의록 탭 UI
- 활동 로그 연결

## Phase 7. AI 기능
- 회의록 요약
- 프로젝트 요약
- 위험 분석
- 다음 액션 추천
- 주간 보고서 초안 생성

## Phase 8. 고도화
- 파일 업로드
- 알림
- 필터/검색 강화
- 통계 대시보드
- 다크 모드 완성도 향상

---

## 12. Codex 작업 원칙 (중요)

Codex는 아래 원칙을 반드시 지켜 구현한다.

### 기본 원칙

1. 한 번에 전체 구현하지 말고 반드시 Phase 단위로 진행한다.
2. 각 Phase 완료 시 진행 상태를 기록한다.
3. PRD 구조를 임의로 변경하지 않는다.
4. Docker 관련 구성은 절대 생성하지 않는다.
5. backend / frontend는 완전히 분리된 구조로 유지한다.
6. 코드에는 유지보수 가능한 구조를 적용한다.
7. 가능한 한 하드코딩을 줄이고 타입/상수/enum을 분리한다.
8. UI는 “세련됨 + 가독성 + 실무형”을 우선한다.
9. API 응답은 일관된 공통 응답 포맷을 사용한다.
10. 예외 처리와 유효성 검사를 반드시 포함한다.
11. 향후 기능 확장을 고려한 구조로 작성한다.
12. 한국어 사용자 기준의 텍스트를 기본으로 한다.


---

### Phase 진행 규칙

각 Phase마다 반드시 아래를 수행한다:

- 필요한 파일 생성
- 핵심 코드 작성
- 실행 방법 설명
- 다음 단계 TODO 작성
- PROJECT_PROGRESS.md 업데이트

---

### 진행 상태 관리 규칙 (매우 중요)

프로젝트 루트에 반드시 다음 파일을 유지한다:

👉 PROJECT_PROGRESS.md

이 파일을 기준으로 개발 상태를 관리한다.

---

### 상태 정의

| 상태 | 의미 |
|------|------|
| NOT STARTED | 시작 안됨 |
| IN PROGRESS | 진행 중 |
| DONE | 완료 |

---

### Codex 행동 규칙

1. 작업 시작 전:
   - PROJECT_MANAGEMENT_PRD.md 읽기
   - PROJECT_PROGRESS.md 읽기

2. 작업 중:
   - 현재 Phase만 수행
   - 다른 Phase 작업 금지

3. 작업 완료 후:
   - 해당 Phase 상태 변경 (IN PROGRESS → DONE)
   - 완료된 작업 기록
   - 다음 TODO 작성

---

### 작업 재개 규칙

Codex는 다음을 반드시 수행한다:

- PROJECT_PROGRESS.md 기준으로 현재 위치 파악
- 완료된 Phase 건너뛰기
- 다음 Phase부터 이어서 진행

---

### 금지 사항

- Dockerfile 생성 금지
- docker-compose.yml 생성 금지
- nginx 설정 생성 금지
- 한 번에 전체 코드 생성 금지

---

## 13. 공통 응답 포맷 예시

```json
{
  "success": true,
  "message": "요청이 성공했습니다.",
  "data": {}
}
```

## 14. 진행 상태 관리 (PROJECT_PROGRESS.md 연동)

이 프로젝트는 단계별 진행 상태를 기록하기 위해 다음 파일을 사용한다.

👉 PROJECT_PROGRESS.md

---

### 목적

- 현재 개발 진행 상태 추적
- 중단 후 이어서 개발 가능
- Codex 자동 진행 흐름 유지

---

### 반드시 지켜야 할 규칙

1. 각 Phase 완료 시 상태 업데이트
2. 현재 진행 Phase 명확히 표시
3. 완료된 작업 기록
4. 다음 작업 TODO 작성
5. 실행 방법 메모 유지

---

### Codex 사용 방법

작업 시작 시:

```text
PROJECT_MANAGEMENT_PRD.md와 PROJECT_PROGRESS.md를 읽고
다음 Phase부터 이어서 진행해줘.
```
