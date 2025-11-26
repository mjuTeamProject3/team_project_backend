# team_project_backend

팀프 3조 백엔드 - 사주 기반 랜덤 채팅 서비스

---

## 📋 목차

- [시작하기](#시작하기)
- [FortuneAPI (사주 분석)](#fortuneapi-사주-분석)
- [서버 실행](#서버-실행)
- [API 테스트](#api-테스트)
- [소셜 로그인 OAuth 설정](#소셜-로그인-oauth-설정)
- [프로젝트 구조](#프로젝트-구조)

---

## 시작하기

### 1. 환경 변수 설정 (.env 파일 생성)

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 포트 설정 (필수)
PORT=3000

# 데이터베이스 연결 정보 (필수)
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT 설정 (필수)
JWT_SECRET=your_jwt_secret_key_change_this_in_production
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# 프론트엔드 URL (소셜 로그인 리다이렉트용)
FRONTEND_URL=http://localhost:3000

# FortuneAPI 설정 (선택사항 - Fortune API만 테스트 시)
FORTUNE_API_URL=http://localhost:8000

# 구글 OAuth 설정 (선택사항 - 소셜 로그인 사용 시)
# GOOGLE_CLIENT_ID=your_google_client_id_here
# GOOGLE_CLIENT_SECRET=your_google_client_secret_here
# GOOGLE_CALLBACK_URL=http://localhost:3000/v1/api/auth/google/callback

# 카카오 OAuth 설정 (선택사항 - 소셜 로그인 사용 시)
# KAKAO_CLIENT_ID=your_kakao_rest_api_key_here
# KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
# KAKAO_CALLBACK_URL=http://localhost:3000/v1/api/auth/kakao/callback

# 네이버 OAuth 설정 (선택사항 - 소셜 로그인 사용 시)
# NAVER_CLIENT_ID=your_naver_client_id_here
# NAVER_CLIENT_SECRET=your_naver_client_secret_here
# NAVER_CALLBACK_URL=http://localhost:3000/v1/api/auth/naver/callback

# OpenAI API 설정 (선택사항 - AI 기능 사용 시)
# OPENAI_API_KEY=your_openai_api_key_here

# Google GenAI API 설정 (선택사항 - AI 기능 사용 시)
# GOOGLE_API_KEY=your_google_api_key_here
```

**주의**: `.env` 파일은 Git에 커밋되지 않습니다. 실제 값은 직접 입력하세요.

### 1.1 .env 파일 위치 & 생성 팁

- ✅ **프로젝트 루트** 하나만 사용 (`team_project_backend/.env`)
- ❌ FortuneAPI 폴더 전용 `.env`: 필요 없음 (루트 `.env`를 자동으로 읽음)
- PowerShell 빠른 생성:
  ```powershell
  @"
  PORT=3000
  DATABASE_URL=mysql://user:password@localhost:3306/db
  FORTUNE_API_URL=http://localhost:8000
  GOOGLE_API_KEY=your-google-api-key
  "@ | Out-File -FilePath .env -Encoding utf8
  ```
- 수정 후에는 FortuneAPI와 Node.js 서버를 모두 재시작해야 함

### 1.2 환경변수 로드 순서 (FortuneAPI)

1. 프로젝트 루트 `.env`
2. FortuneAPI 폴더 `.env` (있는 경우)
3. 시스템 환경 변수

서버 로그에서 `Loaded .env from project root ...`가 출력되면 정상입니다.

### 1.3 문제 해결

- `.env`가 적용되지 않음 → 파일명이 `.env`인지 확인, 서버 재시작
- 키가 감지되지 않음 → `키=값` 형식을 지키고 따옴표/공백 제거
- Gemini API가 설정되지 않음 → `GOOGLE_API_KEY` 추가, 없으면 `/saju/recommend`가 기본 메시지 반환

### 2. 데이터베이스 마이그레이션

```bash
npm run migrate
```

### 3. 서버 실행

```bash
# 개발 모드 (권장)
npm run dev

# 프로덕션 모드
npm start
```

**참고**: `npm run dev`는 Prisma 클라이언트를 자동으로 생성합니다. `npm start`를 사용하려면 먼저 `npx prisma generate`를 실행하세요.

---

## FortuneAPI (사주 분석)

사주 궁합 분석과 대화 주제 추천을 제공하는 FastAPI 기반 Python 서버입니다.

### 설치 및 실행

#### 1. Python 가상환경 생성 및 활성화

```powershell
# FortuneAPI 폴더에서
cd FortuneAPI
python -m venv .venv

# PowerShell
.venv\Scripts\Activate.ps1

# 만약 실행 정책 오류가 나면:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. 의존성 설치

```powershell
pip install -r requirements.txt
```

**주의**: TensorFlow 2.17.1이 포함되어 있습니다. Python 3.11 이상이 필요합니다.

#### 3. 환경 변수 설정

프로젝트 루트의 `.env` 파일에 추가 (FortuneAPI는 자동으로 루트의 `.env`를 읽습니다):

```env
# Gemini 대화 주제 추천용 (선택사항)
GOOGLE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 명시적으로 사용할 Gemini 모델 (선택사항)
GEMINI_MODEL_NAME=gemini-2.5-flash

# 한국천문연구원 음력/양력 OpenAPI (권장)
# 설정하면 일간 간지 계산이 원본과 100% 동일한 값으로 떨어집니다
KOREA_LUNAR_API_KEY=발급받은_서비스키
```

#### 4. FortuneAPI 서버 실행

```powershell
# FortuneAPI 폴더에서
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 또는 프로젝트 루트에서
python -m uvicorn FortuneAPI.main:app --reload --host 0.0.0.0 --port 8000
```

#### 5. 서버 상태 확인

```powershell
curl http://localhost:8000/health
# 또는 브라우저에서 http://localhost:8000/docs (Swagger UI)
```

### FortuneAPI 주요 엔드포인트

#### GET `/health`

상태 정보(모델 로드 여부, 캘린더 데이터)를 반환합니다.

#### POST `/fortune/calculate`

사주 계산

**요청:**

```json
{
  "birthInfo": {
    "year": 1998,
    "month": 2,
    "day": 1,
    "isLunar": false,
    "gender": "female"
  }
}
```

#### POST `/fortune/compatibility`

궁합 분석

**요청:**

```json
{
  "user1": {
    "birthInfo": {
      "year": 2003,
      "month": 8,
      "day": 16,
      "isLunar": false,
      "gender": "male"
    }
  },
  "user2": {
    "birthInfo": {
      "year": 2003,
      "month": 12,
      "day": 4,
      "isLunar": false,
      "gender": "male"
    }
  }
}
```

**응답:**

```json
{
  "score": 53.22,
  "finalScore": 53.22,
  "originalScore": 75.28,
  "stressScore": 54.99,
  "level": "medium",
  "analysis": {
    "overall": "보통 수준의 궁합입니다. 공통 관심사를 찾아보세요.",
    "strengths": ["열정 · 에너지 · 예술 · 중독"],
    "weaknesses": ["무난"],
    "advice": "..."
  },
  "details": {
    "skyYear": 6.98,
    "skyDay": 6.98,
    "earthYear": 6.78,
    "earthMonth": 3.97,
    "earthDay": 5.99
  },
  "traits": {
    "user1": ["열정 · 에너지 · 예술 · 중독"],
    "user2": ["무난"]
  }
}
```

#### POST `/saju/recommend`

Gemini API를 통한 대화 주제 추천 (GOOGLE_API_KEY 필요)

---

## 서버 실행

### 서버 실행 순서

#### 1. FortuneAPI 서버 실행 (포트 8000)

```powershell
cd FortuneAPI
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Node.js 백엔드 서버 실행 (포트 3000)

```powershell
# 프로젝트 루트에서
npm run dev
```

#### 3. 서버 확인

- Node.js 백엔드: http://localhost:3000
- FortuneAPI: http://localhost:8000
- Swagger UI: http://localhost:3000/docs

### 문제 해결

#### Prisma 클라이언트 생성 오류

```powershell
# 방법 1: 개발 모드 사용 (권장)
npm run dev

# 방법 2: 수동 생성
npx prisma generate
npm start
```

#### FortuneAPI 연결 오류

- FortuneAPI 서버 실행 확인: `curl http://localhost:8000/health`
- `.env` 파일에 `FORTUNE_API_URL=http://localhost:8000` 설정 확인

#### uvicorn 인식 안 됨

```powershell
# Python 모듈로 실행 (권장)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### PowerShell 실행 정책 오류

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## API 테스트

### 방법 1: Swagger UI (가장 쉬움) ⭐

1. 브라우저에서 접속: http://localhost:3000/docs
2. 원하는 API 엔드포인트 선택
3. Try it out 클릭
4. 요청 본문 입력
5. Execute 클릭

### 방법 2: PowerShell (`Invoke-RestMethod`)

#### 사주 계산 테스트

```powershell
$body = @{
    year = 1998
    month = 2
    day = 1
    isLunar = $false
    gender = "female"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/calculate" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### 궁합 분석 테스트

```powershell
$body = @{
    user1 = @{
        year = 2003
        month = 8
        day = 16
        isLunar = $false
        gender = "male"
    }
    user2 = @{
        year = 2003
        month = 12
        day = 4
        isLunar = $false
        gender = "male"
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/compatibility" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### 대화 주제 추천 테스트

```powershell
# 먼저 궁합 분석 실행
$compatibilityBody = @{
    user1 = @{ year = 1998; month = 2; day = 1; isLunar = $false; gender = "female" }
    user2 = @{ year = 1995; month = 7; day = 15; isLunar = $false; gender = "male" }
} | ConvertTo-Json -Depth 3

$result = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/compatibility" `
    -Method Post -ContentType "application/json" -Body $compatibilityBody

# 궁합 분석 결과로 주제 추천
$topics = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/recommend-topics" `
    -Method Post -ContentType "application/json" `
    -Body ($result.success | ConvertTo-Json -Depth 3) `
    -TimeoutSec 60

$topics.success
```

### 방법 3: curl

```powershell
# 사주 계산
curl.exe -X POST http://localhost:3000/v1/api/fortune/calculate `
    -H "Content-Type: application/json" `
    -d "{\"year\":1998,\"month\":2,\"day\":1,\"isLunar\":false,\"gender\":\"female\"}"
```

---

## 소셜 로그인 OAuth 설정

### 📋 필수 준비사항

- 서버 실행 중 (포트 확인: 기본 3000)
- `.env` 파일 존재 확인

### 🔵 1. 구글 OAuth 설정

#### Step 1: Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Google 계정으로 로그인

#### Step 2: 프로젝트 생성

1. 상단 **프로젝트 선택** 클릭
2. **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: `my-team-project`)
4. **만들기** 클릭 → 생성 완료까지 대기

#### Step 3: OAuth 동의 화면 설정

1. 좌측 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
2. **외부** 선택 → **만들기**
3. 필수 정보 입력:
   - 앱 이름: `팀프로젝트 백엔드` (원하는 이름)
   - 사용자 지원 이메일: 본인 이메일
   - 앱 로고: 선택사항
4. **저장하고 계속하기** 클릭
5. **범위** 단계: 저장하고 계속
6. **테스트 사용자** 단계: **+ ADD USERS** → 본인 이메일 추가
7. **저장하고 계속하기** 클릭

#### Step 4: OAuth 클라이언트 ID 생성

1. 좌측 메뉴 → **API 및 서비스** → **사용자 인증 정보**
2. 상단 **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름 입력: `Backend Social Login`
5. **승인된 리디렉션 URI** → **+ URI 추가**:
   ```
   http://localhost:3000/v1/api/auth/google/callback
   ```
   (포트가 다르면 포트 번호 변경)
6. **만들기** 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사 ⚠️

#### Step 5: .env 파일에 추가

`.env` 파일에 다음 내용 추가 (주석 제거):

```env
GOOGLE_CLIENT_ID=발급받은_클라이언트_ID
GOOGLE_CLIENT_SECRET=발급받은_보안_비밀번호
GOOGLE_CALLBACK_URL=http://localhost:3000/v1/api/auth/google/callback
```

### 🟡 2. 카카오 OAuth 설정

#### Step 1: Kakao Developers 접속

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인

#### Step 2: 애플리케이션 추가

1. 상단 **내 애플리케이션** 클릭
2. **애플리케이션 추가하기** 클릭
3. 정보 입력:
   - 앱 이름: `팀프로젝트 백엔드` (원하는 이름)
   - 사업자명: 본인 이름 또는 팀 이름
4. **저장** 클릭

#### Step 3: 플랫폼 등록

1. 생성한 앱 선택
2. 좌측 메뉴 → **앱 설정** → **플랫폼**
3. **Web 플랫폼 등록** 클릭
4. 사이트 도메인 입력: `http://localhost:3000`
5. **저장** 클릭

#### Step 4: 카카오 로그인 활성화

1. 좌측 메뉴 → **제품 설정** → **카카오 로그인**
2. **활성화 설정**을 **ON**으로 변경
3. **Redirect URI** 등록: `http://localhost:3000/v1/api/auth/kakao/callback`
4. **저장** 클릭

#### Step 5: 동의 항목 설정

1. **동의 항목** 탭 클릭
2. 필수 설정:
   - **닉네임**: 필수 동의
   - **카카오계정(이메일)**: 선택 동의 (이메일 필요 시)
3. **저장** 클릭

#### Step 6: Client Secret 생성

1. 좌측 메뉴 → **앱 설정** → **보안**
2. **Client Secret 코드 생성** 클릭
3. **REST API 키**와 **Client Secret** 복사 ⚠️

#### Step 7: .env 파일에 추가

`.env` 파일에 다음 내용 추가 (주석 제거):

```env
KAKAO_CLIENT_ID=발급받은_REST_API_키
KAKAO_CLIENT_SECRET=발급받은_Client_Secret
KAKAO_CALLBACK_URL=http://localhost:3000/v1/api/auth/kakao/callback
```

### 🟢 3. 네이버 OAuth 설정

#### Step 1: Naver Developers 접속

1. [Naver Developers](https://developers.naver.com/) 접속
2. 네이버 계정으로 로그인

#### Step 2: 애플리케이션 등록

1. 상단 **Application** → **애플리케이션 등록** 클릭
2. 필수 정보 입력:
   - 애플리케이션 이름: `팀프로젝트 백엔드`
   - 사용 API: **네이버 로그인** 체크
   - 로그인 오픈 API 서비스 환경: **개발용** 선택
   - 서비스 URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/v1/api/auth/naver/callback`
3. **등록하기** 클릭

#### Step 3: Client ID와 Secret 확인

1. 등록 완료 후 화면에서 확인:
   - **Client ID** 복사 ⚠️
   - **Client Secret** 복사 ⚠️

#### Step 4: .env 파일에 추가

`.env` 파일에 다음 내용 추가 (주석 제거):

```env
NAVER_CLIENT_ID=발급받은_Client_ID
NAVER_CLIENT_SECRET=발급받은_Client_Secret
NAVER_CALLBACK_URL=http://localhost:3000/v1/api/auth/naver/callback
```

### ✅ 4. 설정 완료 확인

#### 서버 재시작

`.env` 파일 수정 후 서버를 재시작하세요:

```bash
# 개발 모드에서 실행 중이면 자동 재시작됩니다
# 또는 Ctrl+C로 중지 후 다시 실행
npm run dev
```

#### 테스트

브라우저에서 다음 URL로 접속:

- **구글 로그인**: http://localhost:3000/v1/api/auth/google
- **카카오 로그인**: http://localhost:3000/v1/api/auth/kakao
- **네이버 로그인**: http://localhost:3000/v1/api/auth/naver

각 URL로 접속하면 해당 소셜 로그인 페이지로 리다이렉트되어야 합니다.

### 🚨 OAuth 문제 해결

#### 포트가 다른 경우

`.env` 파일의 `PORT` 값과 콜백 URL의 포트를 일치시켜야 합니다.

예: 포트가 8080인 경우

```env
PORT=8080
GOOGLE_CALLBACK_URL=http://localhost:8080/v1/api/auth/google/callback
```

#### OAuth 설정 후에도 경고가 나오는 경우

1. `.env` 파일에 값을 정확히 입력했는지 확인
2. 서버 재시작 확인
3. 환경 변수 이름 대소문자 확인 (정확히 일치해야 함)

#### 리다이렉트 URI 불일치 오류

- 각 플랫폼의 콜백 URL과 `.env`의 콜백 URL이 정확히 일치해야 합니다
- 마지막 슬래시(/)도 확인하세요

**💡 팁**: 하나씩 설정해도 됩니다. 예를 들어 구글만 먼저 설정하고 테스트한 후, 카카오와 네이버를 추가해도 됩니다.

---

## 프로젝트 구조

### 🏗️ 전체 구조

프로젝트는 계층형 아키텍처를 따르며, 요청은 위에서 아래로, 응답은 아래에서 위로 흐릅니다.

```
Entry Point (index.js)
    ↓
Routing Layer (routes)
    ↓
Business Logic Layer (controllers → services)
    ↓
Data Access Layer (repositories → Prisma ORM)
    ↓
External Database (MySQL)
```

### 📋 계층별 역할

#### 1️⃣ 진입점 (Entry Point)

**index.js**: 모든 클라이언트 요청의 최초 진입점

- 애플리케이션의 초기 설정(configurations, middlewares 등)을 로드
- Express 서버 생성 및 미들웨어 설정 (CORS, JSON 파싱, 세션 등)
- WebSocket 서버 초기화
- HTTP/WebSocket 서버 시작

#### 2️⃣ 환경설정 및 지원 계층 (Configuration & Supporting)

요청 처리 흐름 전반에 걸쳐 필요한 공통 기능 및 설정을 제공합니다.

**Configuration (configs, middlewares, utils)**:

- **configs**: 데이터베이스 연결 정보, Passport 소셜 로그인, CORS, Swagger 등 핵심 환경 설정
- **middlewares**: 요청/응답 주기에 개입하여 인증(`auth.middleware.js`), 에러 처리(`error.middleware.js`), 상태 관리 등 공통 작업 수행
- **utils**: JWT 토큰 생성/검증, 비밀번호 암호화 등 애플리케이션 전반에서 사용되는 유틸리티 함수

**Supporting (dtos, errors, realtime)**:

- **dtos (Data Transfer Objects)**: 계층 간 데이터 전송 시 사용되는 객체의 형식을 정의 (요청/응답 데이터 구조화)
- **errors**: 커스텀 에러 클래스 및 중앙 집중식 에러 핸들링 로직 관리
- **realtime**: WebSocket을 통한 실시간 통신 모듈 (채팅 매칭, 메시지 전송, 주제 제안 등)

#### 3️⃣ 라우팅 계층 (Routing)

**routes**: 클라이언트 요청을 적절한 컨트롤러로 분배

- URI 및 HTTP Method(GET, POST, PUT, DELETE 등)에 따라 요청을 적절한 비즈니스 로직으로 라우팅
- 이 계층은 Configuration 계층의 미들웨어(인증 등)와 Supporting 계층의 dtos를 활용하여 요청 검증 및 처리

**중요**: 일부 라우트는 컨트롤러를 거치지 않고 직접 서비스를 호출하기도 합니다 (예: `message.route.js`).

#### 4️⃣ 비즈니스 로직 계층 (Business Logic)

**controllers**: 라우트로부터 요청을 받아 처리하는 인터페이스 계층

- 요청의 유효성 검사(DTO를 통한 데이터 구조 검증)
- 서비스 계층에 필요한 데이터 전달
- 서비스에서 반환된 결과를 받아 HTTP 응답으로 변환
- 에러 발생 시 다음 미들웨어로 전달

**services**: 컨트롤러로부터 전달받은 데이터를 기반으로 실제 비즈니스 로직 수행

- 로그인/회원가입, 친구 요청, 알림 처리 등의 핵심 비즈니스 규칙 구현
- Supporting 계층의 errors를 사용하여 예외 처리 수행
- 데이터 처리 필요 시 Data Access 계층과 통신
- 외부 API 연동 (AI 서비스: OpenAI, Google GenAI)

#### 5️⃣ 데이터 접근 계층 (Data Access)

비즈니스 로직과 데이터베이스 간의 상호작용을 추상화합니다.

**repositories**: 서비스 계층의 요청을 받아 데이터베이스 쿼리 실행 로직 캡슐화

- Repository Pattern 구현
- Prisma Client를 사용한 데이터 조회/생성/수정/삭제 로직
- 각 엔티티별로 독립적인 repository 파일 구성

**Prisma ORM**: ORM(Object-Relational Mapping) 도구

- repositories에서 JavaScript 코드를 통해 데이터베이스 조작
- `schema.prisma` 파일에서 데이터 모델 정의
- 타입 안전성과 자동 SQL 생성 제공

#### 6️⃣ 외부 데이터베이스 (External Database)

**MySQL**: 애플리케이션의 모든 데이터를 영구적으로 저장하는 최종 저장소

- User, Like, Friendship, Notification, Message 등의 테이블
- Data Access 계층을 통해서만 접근 가능
- Prisma를 통해 연결 및 쿼리 실행

### 🔄 데이터 흐름

#### HTTP Request

1. **클라이언트** → HTTP 요청 생성
2. **index.js** → 서버에 요청 도착, 미들웨어 적용
3. **routes** → URI/Method에 따른 라우팅 결정
4. **middlewares** → 인증, 권한 확인 (필요 시)
5. **controllers** → 요청 데이터 검증 및 서비스 호출
6. **services** → 비즈니스 로직 실행
7. **repositories** → 데이터 접근 요청
8. **Prisma ORM** → SQL 쿼리 생성 및 실행
9. **MySQL** → 데이터 조회/저장 수행
10. 역순으로 응답 반환 (repositories → services → controllers → routes → 클라이언트)

#### WebSocket

1. **클라이언트** → WebSocket 연결 요청
2. **index.js** → Socket.IO 서버 초기화
3. **realtime/socket.js** → JWT 토큰 인증
4. **services** → 실시간 기능 실행 (매칭, 채팅, 주제 제안 등)
5. **Prisma** → 필요한 데이터 조회
6. **클라이언트** ← 실시간 이벤트 전송

### 🔗 주요 의존성 관계

```
index.js
  ├─→ configs (db.config, passport.config, cors.config, swagger.config)
  ├─→ middlewares (auth.middleware, error.middleware, state.middleware)
  ├─→ routes (auth.route, user.route, friend.route, etc.)
  └─→ realtime (socket.js)

controllers
  ├─→ services (비즈니스 로직 호출)
  ├─→ dtos (데이터 검증)
  └─→ errors (에러 처리)

services
  ├─→ repositories (데이터 접근)
  ├─→ utils (jwt.util, crypto.util 등)
  ├─→ errors (비즈니스 에러)
  └─→ dtos (데이터 변환)

repositories
  ├─→ configs/db.config (Prisma Client)
  └─→ Prisma → MySQL

realtime
  ├─→ utils (JWT 검증)
  ├─→ services (saju, topic, report 등)
  └─→ Prisma (데이터 조회)
```

### 📊 의존성 다이어그램

#### 자동 생성

```bash
# Mermaid 형식으로 그래프 자동 생성
npm run dep:graph
```

#### 수동 다이어그램 작성

다이어그램 파일 (`.mmd`)을 VS Code의 Mermaid Preview 확장이나 https://mermaid.live/ 에서 확인할 수 있습니다.

**시각화 방법:**

- VS Code: Mermaid Preview 확장 설치
- 온라인: https://mermaid.live/
- GitHub: 자동 렌더링

### Mermaid 다이어그램 빠른 가이드

```mermaid
flowchart LR
    subgraph CONFIGS["📁 configs"]
        DB[db.config.js]
        PASSPORT[passport.config.js]
    end

    AUTH_ROUTE[auth.route.js] --> AUTH_CTRL[auth.controller.js]
    AUTH_CTRL --> AUTH_SVC[auth.service.js]
    AUTH_SVC --> AUTH_REPO[auth.repository.js]
    AUTH_REPO --> PRISMA[(Prisma)]

    CONFIGS --> AUTH_ROUTE

    classDef folder fill:#FFD700,stroke:#FF6347,stroke-width:3px
    classDef file fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    class CONFIGS folder
    class DB,PASSPORT,AUTH_ROUTE,AUTH_CTRL,AUTH_SVC,AUTH_REPO,PRISMA file
```

#### 작성 팁

- `flowchart LR`(좌→우) 또는 `flowchart TB`(상→하)로 방향 지정
- `subgraph`로 폴더 그룹화, `classDef`로 색상 설정
- 핵심 파일만 연결해 가독성을 유지하고, 좌→우 단방향 화살표를 권장

---

## 보안성 자체 평가

### 회원 정보 보호 전략

- **비밀번호 해싱**: SHA-512 단방향 해시로 평문 저장 방지
- **JWT 이중 토큰**: Access Token(15m) + Refresh Token(7d) 구조, 만료 시 자동 재발급
- **토큰 검증 미들웨어**: Bearer 토큰 서명/만료 검사 후 통과한 요청만 처리
- **환경 변수 관리**: `.env`에 민감 정보 분리, Git에는 커밋 금지
- **세션 관리**: 소셜 로그인용 Express Session (`resave=false`, `saveUninitialized=false`)
- **DB 보안**: Prisma ORM으로 SQL Injection 예방, 연결 정보는 환경 변수로 주입
- **에러 처리**: 중앙 에러 핸들러로 상세 스택 노출 최소화

### 강점 요약

✅ 비밀번호 단방향 해싱  
✅ JWT + Refresh 토큰 기반 인증  
✅ 환경 변수 기반 민감 정보 보호  
✅ Prisma ORM으로 안전한 쿼리  
✅ 공통 미들웨어를 통한 토큰 검증

### 개선 예정 항목

⚠️ CORS가 현재 `*` 허용 → 배포 시 도메인 제한 필요  
⚠️ HTTPS 미적용 환경에서는 secure 쿠키 사용 불가  
⚠️ 비밀번호 복잡도 검증 로직 부재 → 향후 정책 강화 예정

---

## 주의사항

1. **로컬 개발**:

   - 모든 콜백 URL은 `http://localhost:YOUR_PORT` 형식으로 설정
   - 실제 포트 번호 확인 필요

2. **프로덕션 배포**:

   - 실제 도메인으로 리다이렉트 URI 변경
   - HTTPS 필수 (대부분의 OAuth 제공자 요구사항)

3. **보안**:

   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - Client Secret은 외부에 노출되지 않도록 주의

4. **테스트**:
   - 각 플랫폼의 테스트 모드 설정 확인
   - 테스트 사용자 추가 (구글의 경우)

---

## Git 워크플로우

### 새 브랜치 생성 및 PR 올리기

#### 1. 현재 상태 확인

```powershell
git status
git branch
git remote -v
```

#### 2. 새 브랜치 생성 및 전환

```powershell
# main 브랜치에서 새 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/작업내용

# 또는 최신 Git 명령어
git switch main
git pull origin main
git switch -c feature/작업내용
```

#### 3. 변경사항 스테이징 및 커밋

```powershell
# 모든 변경사항 추가
git add .

# 또는 특정 파일만 추가
git add src/utils/fortune.util.js

# 커밋
git commit -m "feat: FortuneAPI 통합 및 사주 로직 구현

- FortuneAPI와 Node.js 백엔드 통합
- 사주 계산 API 엔드포인트 구현
- 궁합 분석 API 엔드포인트 구현"

# 간단한 커밋 메시지
git commit -m "feat: FortuneAPI 통합"
```

#### 4. 원격 저장소에 푸시

```powershell
# 첫 푸시 (브랜치 생성)
git push -u origin feature/작업내용

# 이후 푸시
git push
```

#### 5. GitHub에서 PR 생성

1. GitHub 저장소로 이동
2. "Compare & pull request" 버튼 클릭 (자동으로 나타날 수 있음)
3. PR 제목 작성: `feat: FortuneAPI 통합 및 사주 로직 구현`
4. PR 설명 작성:

   ```markdown
   ## 변경사항

   - FortuneAPI와 Node.js 백엔드 통합
   - 사주 계산 API 엔드포인트 구현
   - 궁합 분석 API 엔드포인트 구현

   ## 테스트

   - [x] FortuneAPI 서버 실행 확인
   - [x] 사주 계산 API 테스트
   - [x] 궁합 분석 API 테스트

   ## 관련 이슈

   - #이슈번호 (있다면)
   ```

5. 리뷰어 지정 (필요한 경우)
6. "Create pull request" 클릭

### 커밋 메시지 컨벤션

일반적인 형식:

```
<type>: <subject>

<body>
```

#### Type 종류

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드 업무 수정

#### 예시

```powershell
# 기능 추가
git commit -m "feat: FortuneAPI 통합"

# 버그 수정
git commit -m "fix: OpenAI 설정 오류 수정"

# 문서 수정
git commit -m "docs: API 사용법 추가"

# 리팩토링
git commit -m "refactor: Fortune 서비스 로직 개선"
```

### 문제 해결

#### 충돌 해결

```powershell
# 원격 저장소의 최신 변경사항 가져오기
git fetch origin
git merge origin/main

# 충돌 해결 후
git add .
git commit -m "merge: 충돌 해결"
git push
```

#### 커밋 수정

```powershell
# 마지막 커밋 메시지 수정
git commit --amend -m "수정된 커밋 메시지"

# 강제 푸시 (주의!)
git push --force
```

#### 커밋 취소

```powershell
# 마지막 커밋 취소 (변경사항 유지)
git reset --soft HEAD~1

# 마지막 커밋 취소 (변경사항 삭제)
git reset --hard HEAD~1
```

### PR 올리기 전 체크리스트

- [ ] 코드가 정상 작동하는지 확인
- [ ] 테스트 통과 확인
- [ ] 불필요한 파일 제거 (node_modules, .env 등)
- [ ] .gitignore 확인
- [ ] 커밋 메시지 작성
- [ ] PR 설명 작성
- [ ] 리뷰어 지정
