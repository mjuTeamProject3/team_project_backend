# Gemini 대화 주제 추천 테스트 가이드

## 테스트 전 준비사항

### 1. 서버 실행 확인
- [ ] FortuneAPI 서버 실행 중 (`http://localhost:8000`)
- [ ] Node.js 백엔드 서버 실행 중 (`http://localhost:3000`)
- [ ] Gemini API 키 설정 (선택사항, 없으면 기본 메시지 반환)

### 2. 환경변수 설정 (선택사항)
```env
# FortuneAPI/.env 파일에 추가
GOOGLE_API_KEY=your-google-api-key
```

## 테스트 방법

### 방법 1: Swagger UI 사용 (가장 쉬움) ⭐

#### Step 1: Swagger UI 접속
1. 브라우저에서 접속: http://localhost:3000/docs
2. `POST /v1/api/fortune/recommend-topics` 찾기
3. Try it out 클릭

#### Step 2: 요청 본문 입력
```json
{
  "score": 78,
  "level": "high",
  "analysis": {
    "overall": "좋은 궁합입니다",
    "strengths": ["서로 보완", "안정적"],
    "weaknesses": ["가끔 갈등"],
    "advice": "소통을 통해 극복하세요"
  },
  "details": {
    "heavenlyStems": 70,
    "earthlyBranches": 80,
    "fiveElements": 75,
    "zodiacSign": 85
  }
}
```

#### Step 3: Execute 클릭
4. Execute 클릭
5. 응답 확인

### 방법 2: 전체 플로우 테스트 (궁합 분석 → 주제 추천)

#### Step 1: 궁합 분석 먼저 실행
```powershell
# 궁합 분석 요청
$body = @{
    user1 = @{
        year = 1998
        month = 2
        day = 1
        hour = 14
        minute = 30
        isLunar = $false
    }
    user2 = @{
        year = 1995
        month = 7
        day = 15
        hour = 9
        minute = 0
        isLunar = $false
    }
} | ConvertTo-Json -Depth 3

$compatibility = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/compatibility" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# 궁합 분석 결과 확인
$compatibility.success
```

#### Step 2: 궁합 분석 결과로 주제 추천
```powershell
# 궁합 분석 결과를 주제 추천에 사용
$topicsBody = $compatibility.success | ConvertTo-Json -Depth 3

$topics = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/recommend-topics" `
    -Method Post `
    -ContentType "application/json" `
    -Body $topicsBody

# 주제 추천 결과 확인
$topics.success
```

### 방법 3: PowerShell 한 줄 명령어

#### 직접 테스트
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
    -Body $body
```

### 방법 4: curl 사용

#### curl 명령어
```powershell
curl.exe -X POST http://localhost:3000/v1/api/fortune/recommend-topics `
    -H "Content-Type: application/json" `
    -d "{\"score\":78,\"level\":\"high\",\"analysis\":{\"overall\":\"좋은 궁합입니다\",\"strengths\":[\"서로 보완\",\"안정적\"],\"weaknesses\":[\"가끔 갈등\"],\"advice\":\"소통을 통해 극복하세요\"},\"details\":{\"heavenlyStems\":70,\"earthlyBranches\":80,\"fiveElements\":75,\"zodiacSign\":85}}"
```

### 방법 5: FortuneAPI 직접 호출

#### FortuneAPI 서버에서 직접 호출
```powershell
# FortuneAPI 직접 호출 (포트 8000)
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

Invoke-RestMethod -Uri "http://localhost:8000/saju/recommend" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## 예상 응답

### 성공 응답 (Gemini API 키 있음)
```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": [
    {
      "topic": "여행 계획",
      "reason": "두 사람의 오행이 상생 관계여서 함께하는 활동을 하면 좋습니다. 여행을 통해 서로를 더 잘 이해할 수 있을 것입니다."
    }
  ]
}
```

### 응답 (Gemini API 키 없음)
```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": [
    {
      "topic": "대화 주제 추천 불가",
      "reason": "Gemini API가 설정되지 않았습니다. GOOGLE_API_KEY 환경변수를 설정해주세요."
    }
  ]
}
```

### FortuneAPI 직접 호출 응답
```json
{
  "status": "success",
  "topics": [
    {
      "topic": "여행 계획",
      "reason": "두 사람의 오행이 상생 관계여서 함께하는 활동을 하면 좋습니다."
    }
  ]
}
```

## 전체 플로우 테스트 스크립트

### PowerShell 스크립트
```powershell
# 1. 궁합 분석
Write-Host "=== 궁합 분석 ===" -ForegroundColor Green
$compatibilityBody = @{
    user1 = @{
        year = 1998
        month = 2
        day = 1
        hour = 14
        minute = 30
        isLunar = $false
    }
    user2 = @{
        year = 1995
        month = 7
        day = 15
        hour = 9
        minute = 0
        isLunar = $false
    }
} | ConvertTo-Json -Depth 3

$compatibility = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/compatibility" `
    -Method Post `
    -ContentType "application/json" `
    -Body $compatibilityBody

Write-Host "궁합 점수: $($compatibility.success.score)" -ForegroundColor Yellow
Write-Host "궁합 등급: $($compatibility.success.level)" -ForegroundColor Yellow

# 2. 대화 주제 추천
Write-Host "`n=== 대화 주제 추천 ===" -ForegroundColor Green
$topicsBody = $compatibility.success | ConvertTo-Json -Depth 3

$topics = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/recommend-topics" `
    -Method Post `
    -ContentType "application/json" `
    -Body $topicsBody

Write-Host "추천 주제: $($topics.success[0].topic)" -ForegroundColor Yellow
Write-Host "추천 이유: $($topics.success[0].reason)" -ForegroundColor Yellow
```

## 문제 해결

### 1. Gemini API 키 없을 때
- 서버는 정상 실행됨
- 대화 주제 추천 시 기본 메시지 반환
- 실제 추천을 받으려면 `GOOGLE_API_KEY` 설정 필요

### 2. 연결 오류
- FortuneAPI 서버 실행 확인: `curl http://localhost:8000/health`
- Node.js 백엔드 서버 실행 확인: `curl http://localhost:3000/docs`

### 3. 타임아웃 오류
- Gemini API 호출 시간이 길 수 있음 (30초 타임아웃 설정)
- 서버 로그 확인

## 체크리스트

- [ ] FortuneAPI 서버 실행 중
- [ ] Node.js 백엔드 서버 실행 중
- [ ] Gemini API 키 설정 (선택사항)
- [ ] 궁합 분석 결과 준비
- [ ] 대화 주제 추천 API 테스트

