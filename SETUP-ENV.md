# 환경변수 설정 가이드

## .env 파일 위치

**프로젝트 루트에 하나의 .env 파일만 만들면 됩니다!**

- ✅ 프로젝트 루트: `team_project_backend/.env` (Node.js 서버와 공유)
- ❌ FortuneAPI/.env: 필요 없음 (프로젝트 루트의 .env를 자동으로 사용)

## .env 파일 생성 방법

### 방법 1: PowerShell에서 생성 (권장)

프로젝트 루트에서:

```powershell
# 프로젝트 루트에서
@"
# Database
DATABASE_URL=your-database-url

# Server
PORT=3000

# FortuneAPI
FORTUNE_API_URL=http://localhost:8000

# Gemini API (Google Generative AI)
GOOGLE_API_KEY=your-google-api-key-here
# GEMINI_MODEL_NAME=gemini-2.5-flash  # 선택사항: 기본값은 gemini-2.5-flash

# OpenAI (선택사항)
OPENAI_API_KEY=your-openai-api-key-here
"@ | Out-File -FilePath .env -Encoding utf8
```

### 방법 2: 텍스트 에디터로 생성

1. 프로젝트 루트에서 `.env` 파일 생성
2. 다음 내용 입력:
   ```env
   # Database
   DATABASE_URL=your-database-url

   # Server
   PORT=3000

   # FortuneAPI
   FORTUNE_API_URL=http://localhost:8000

   # Gemini API (Google Generative AI)
   GOOGLE_API_KEY=your-google-api-key-here

   # OpenAI (선택사항)
   OPENAI_API_KEY=your-openai-api-key-here
   ```
3. 저장

## 필요한 환경변수

### 필수 (서버 실행)

- `DATABASE_URL`: 데이터베이스 연결 URL
- `PORT`: Node.js 서버 포트 (기본값: 3000)

### 선택사항 (기능별)

- `GOOGLE_API_KEY`: Gemini API 키 (대화 주제 추천 기능)
- `GEMINI_MODEL_NAME`: Gemini 모델 이름 (기본값: gemini-2.5-flash)
  - 지원 모델: `gemini-2.5-flash`, `gemini-2.0-flash-exp`, `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro`
- `OPENAI_API_KEY`: OpenAI API 키 (OpenAI 기능)
- `FORTUNE_API_URL`: FortuneAPI 서버 URL (기본값: http://localhost:8000)

## Gemini API 키 설정

### 1. Google AI Studio에서 API 키 발급

1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. API 키 복사

### 2. .env 파일에 추가

```env
GOOGLE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 서버 재시작

```powershell
# FortuneAPI 서버 재시작
cd FortuneAPI
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Node.js 서버 재시작
npm run dev
```

## 환경변수 로드 순서

FortuneAPI는 다음 순서로 환경변수를 로드합니다:

1. **프로젝트 루트의 .env 파일** (우선순위 높음)
2. FortuneAPI 폴더의 .env 파일 (있으면)
3. 시스템 환경변수

## 확인

서버 시작 시 다음과 같은 메시지가 표시됩니다:

**정상:**
- `Loaded .env from project root: ...` (프로젝트 루트의 .env 로드됨)

**오류:**
- `Warning: GOOGLE_API_KEY is not set.` → API 키가 설정되지 않음
- `Warning: Failed to configure Gemini API: ...` → API 키 설정 오류

## 주의사항

- `.env` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- API 키는 비공개로 유지하세요
- `.env` 파일을 수정한 후에는 서버를 재시작해야 합니다

## 문제 해결

### 1. .env 파일이 로드되지 않을 때

- 프로젝트 루트에 .env 파일이 있는지 확인
- 파일명이 정확히 `.env`인지 확인 (`.env.txt` 아님)
- 서버를 프로젝트 루트에서 실행

### 2. 환경변수가 적용되지 않을 때

- 서버 재시작
- .env 파일의 형식 확인 (공백, 따옴표 제거)
- 환경변수 이름 확인 (대소문자 구분)

