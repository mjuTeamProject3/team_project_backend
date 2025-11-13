# Gemini API 키 설정 가이드

## 문제: "API key not valid" 오류

Gemini API 키가 유효하지 않거나 설정되지 않았을 때 발생하는 오류입니다.

## 해결 방법

### 1. Google AI Studio에서 API 키 발급받기

1. **Google AI Studio 접속**
   - https://aistudio.google.com/app/apikey 방문
   - Google 계정으로 로그인

2. **API 키 생성**
   - "Create API Key" 버튼 클릭
   - 프로젝트 선택 (또는 새로 생성)
   - API 키 복사

### 2. FortuneAPI/.env 파일 생성

FortuneAPI 폴더에 `.env` 파일을 생성하고 API 키를 설정:

```env
GOOGLE_API_KEY=여기에_발급받은_API_키_붙여넣기
```

**예시:**
```env
GOOGLE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. .env 파일 생성 방법

#### 방법 1: PowerShell에서 생성
```powershell
# FortuneAPI 폴더로 이동
cd FortuneAPI

# .env 파일 생성
@"
GOOGLE_API_KEY=your-api-key-here
"@ | Out-File -FilePath .env -Encoding utf8
```

#### 방법 2: 텍스트 에디터로 생성
1. FortuneAPI 폴더에서 `.env` 파일 생성
2. 다음 내용 입력:
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```
3. 저장

#### 방법 3: .env.example 복사
```powershell
# FortuneAPI 폴더에서
cp .env.example .env
# 또는
copy .env.example .env
```

그 다음 `.env` 파일을 열어서 `your-google-api-key-here`를 실제 API 키로 변경

### 4. FortuneAPI 서버 재시작

.env 파일을 생성하거나 수정한 후에는 서버를 재시작해야 합니다:

```powershell
# FortuneAPI 폴더에서
# 서버 중지 (Ctrl+C)
# 서버 재시작
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. API 키 확인

서버 시작 시 다음과 같은 메시지가 표시됩니다:

**정상:**
- API 키가 설정되어 있으면 아무 메시지도 표시되지 않음 (정상)

**오류:**
- `Warning: GOOGLE_API_KEY is not set.` → API 키가 설정되지 않음
- `Warning: Failed to configure Gemini API: ...` → API 키 설정 오류

## API 키 형식 확인

유효한 Gemini API 키는 다음과 같은 형식입니다:
- `AIzaSy`로 시작
- 약 39자의 문자열
- 예: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 문제 해결

### 1. API 키가 유효하지 않을 때
- Google AI Studio에서 새로운 API 키 발급
- .env 파일의 API 키 확인 (공백, 따옴표 제거)
- 서버 재시작

### 2. .env 파일이 로드되지 않을 때
- FortuneAPI 폴더에 .env 파일이 있는지 확인
- 파일명이 정확히 `.env`인지 확인 (`.env.txt` 아님)
- 서버를 FortuneAPI 폴더에서 실행

### 3. 환경변수로 설정하기 (대안)

.env 파일 대신 환경변수로 설정:

**PowerShell:**
```powershell
$env:GOOGLE_API_KEY="your-api-key-here"
```

**Windows (시스템 환경변수):**
1. 시스템 속성 → 환경 변수
2. 새로 만들기 → 변수 이름: `GOOGLE_API_KEY`, 변수 값: API 키
3. 서버 재시작

## 테스트

API 키 설정 후 테스트:

```powershell
# 대화 주제 추천 테스트
$body = @{
    score = 78
    level = "high"
    analysis = @{
        overall = "좋은 궁합입니다"
        strengths = @("서로 보완", "안정적")
        weaknesses = @("가끔 갈등")
        advice = "소통을 통해 극복하세요"
    }
    details = @{
        heavenlyStems = 70
        earthlyBranches = 80
        fiveElements = 75
        zodiacSign = 85
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/recommend-topics" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body `
    -TimeoutSec 60
```

## 참고

- Google AI Studio: https://aistudio.google.com/app/apikey
- Gemini API 문서: https://ai.google.dev/docs
- API 키는 비공개로 유지하세요 (Git에 커밋하지 마세요)

