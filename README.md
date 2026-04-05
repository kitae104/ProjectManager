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

