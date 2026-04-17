# ProjectManager

학생 프로젝트 관리 플랫폼입니다.

## 실행 전 준비

### 공통
- Java 21
- Node.js 22+
- MySQL 8+

### DB 생성
MySQL에서 아래 DB를 먼저 생성해 주세요.

```sql
CREATE DATABASE project_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Backend 실행

경로: `backend`

### 1) 환경 변수 준비
`backend/.env.example` 값을 참고해서 OS 환경 변수로 설정하거나, IDE 실행 설정에 넣어주세요.

주요 값:
- `SERVER_PORT=8080`
- `DB_URL=jdbc:mysql://localhost:3306/project_manager?...`
- `DB_USERNAME=root`
- `DB_PASSWORD=root`
- `JWT_SECRET=...`
- `JWT_ACCESS_TOKEN_EXPIRATION_SECONDS=86400`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173`

### 2) 실행

Windows:
```bash
cd backend
./gradlew.bat bootRun
```

macOS/Linux:
```bash
cd backend
./gradlew bootRun
```

### 3) 확인
- 헬스체크: `http://localhost:8080/api/health`

## Frontend 실행

경로: `frontend`

### 1) 환경 변수 준비
`frontend/.env.example`를 참고해 `.env` 파일을 생성하세요.

예시:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 2) 실행
```bash
cd frontend
npm install
npm run dev
```

### 3) 확인
- 접속: `http://localhost:5173`

## 빌드/테스트

### Backend 테스트
```bash
cd backend
./gradlew.bat test
```

### Frontend 빌드
```bash
cd frontend
npm run build
```

## Release 점검

루트에서 아래 스크립트를 실행하면 백엔드 테스트 + 프론트 빌드를 순서대로 수행합니다.

Windows PowerShell:
```powershell
./release-check.ps1
```

Release bundle packaging (backend jar + frontend dist):
```powershell
./release-package.ps1
```

Deployment checklist:
- `DEPLOYMENT_CHECKLIST.md`

API performance baseline check (requires running backend server):
```powershell
./api-performance-check.ps1
```

Run backend + performance check in one command (DB credentials configurable):
```powershell
./run-performance-with-backend.ps1 -DbUsername <user> -DbPassword <password>
```

## 테스트 데모 데이터 생성

아래 스크립트를 실행하면 테스트 환경(H2 통합 테스트)에서
`user1/user2/user3` 계정(비밀번호 `11112222`)과 샘플 프로젝트/업무/일정/문서/회의록/AI 인사이트를 생성하고,
결과 요약 JSON을 출력합니다.

```powershell
./run-demo-scenario.ps1
```

생성 결과 파일:
- `backend/build/reports/demo/demo-scenario-summary.json`

## PowerShell 실행 스크립트

프로젝트 루트(`ProjectManager`)에서 PowerShell을 열고 실행합니다.

### 0) 스크립트 실행 권한 문제(최초 1회)
PowerShell에서 실행 정책으로 스크립트가 막히면 아래 명령을 먼저 실행하세요.

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

현재 세션에서만 임시 허용하려면:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
```

백엔드만 실행:
```powershell
./run-backend.ps1
```

- Spring Boot가 포그라운드로 실행됩니다.
- 종료: `Ctrl + C`

프론트엔드만 실행:
```powershell
./run-frontend.ps1
```

- Vite dev server가 포그라운드로 실행됩니다.
- 종료: `Ctrl + C`

프론트 의존성 설치 후 실행:
```powershell
./run-frontend.ps1 -InstallDeps
```

추가 옵션:

```powershell
./run-frontend.ps1 -DevHost 0.0.0.0 -Port 5173
```

백엔드 + 프론트 동시 실행(각각 새 창):
```powershell
./run-dev.ps1
```

프론트 의존성 설치까지 포함해서 동시 실행:

```powershell
./run-dev.ps1 -InstallFrontendDeps
```

## 역할별 권한 정책 (2026-04-17)

아래 정책이 현재 시스템에 적용되어 있습니다.

### 권한 매트릭스
| 기능 | ADMIN | LEADER | MEMBER |
|---|---|---|---|
| 프로젝트 생성 + 팀장 지정 | 가능 | 불가 | 불가 |
| 프로젝트 목록/상세 조회 | 전체 조회 가능 | 본인 팀장 프로젝트만 | 참여 프로젝트만 |
| 프로젝트 수정/삭제 | 불가(조회 전용) | 본인 팀장 프로젝트만 가능 | 불가 |
| 팀원 추가/제거/역할 지정 | 불가(조회 전용) | 본인 팀장 프로젝트만 가능 | 불가 |
| Todo 생성/삭제/전체 수정 | 불가(조회 전용) | 본인 팀장 프로젝트만 가능 | 불가 |
| Todo 일정/진행 상태 업데이트 | 불가(조회 전용) | 가능 | 본인 할당 업무만 가능 |
| 문서/회의록/캘린더(마일스톤/일정) 조회 | 가능 | 가능 | 가능 |
| 문서/회의록/캘린더(마일스톤/일정) 생성/수정/삭제 | 불가(조회 전용) | 본인 팀장 프로젝트만 가능 | 불가 |

### 대시보드 분리
- `ADMIN`: 전체 프로젝트 관제 지표
- `LEADER`: 본인 프로젝트/팀 운영 지표
- `MEMBER`: 본인 할당 업무 일정/진행 지표

상세 요구사항은 `PROJECT_MANAGEMENT_PRD.md`의 `5-1` ~ `5-6` 섹션을 참고하세요.
