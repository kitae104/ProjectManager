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

## 권한별 새 프로젝트 생성 예시

아래는 현재 제공 권한(`ADMIN`, `LEADER`, `MEMBER`, `MENTOR`, `PROFESSOR`, `VIEWER`) 기준의
`새 프로젝트 생성` 사용 예시입니다.

- `ADMIN`
  - 학기 운영용 공식 프로젝트를 먼저 생성하고 리더를 지정
  - 예: `2026-1 캡스톤 공통 운영`
- `LEADER`
  - 팀 실제 개발 프로젝트를 생성하고 바로 팀원/업무/일정 세팅
  - 예: `AI 회의록 자동화 플랫폼`
- `MEMBER`
  - 정책 허용 시 실험/서브 프로젝트 초안을 생성(권장: 리더 승인 후)
  - 예: `추천 모델 성능 개선 실험`
- `MENTOR`
  - 멘토링 점검용 프로젝트를 생성해 리스크/피드백 중심으로 추적
  - 예: `멘토링 점검 - 3팀`
- `PROFESSOR`
  - 분반/과목 운영 프로젝트를 생성해 발표/평가 흐름을 관리
  - 예: `2026-1 캡스톤 분반 A 운영`
- `VIEWER`
  - 기본 정책: 조회 전용(생성 권한 미부여 권장)

상세 요구사항은 `PROJECT_MANAGEMENT_PRD.md`의
`5-2 프로젝트 관리`와 `5-9 설정(Settings)` 섹션을 참고하세요.
