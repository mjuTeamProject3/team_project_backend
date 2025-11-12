# Fortune API 빠른 테스트 가이드

## 방법 1: Invoke-RestMethod 사용 (가장 쉬움) ⭐

### 사주 계산 테스트
```powershell
$body = @{
    year = 1998
    month = 2
    day = 1
    hour = 14
    minute = 30
    isLunar = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/calculate" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### 궁합 분석 테스트
```powershell
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

Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/compatibility" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

## 방법 2: curl.exe 사용 (실제 curl)

### 사주 계산 테스트
```powershell
curl.exe -X POST http://localhost:3000/v1/api/fortune/calculate `
    -H "Content-Type: application/json" `
    -d "{\"year\":1998,\"month\":2,\"day\":1,\"hour\":14,\"minute\":30,\"isLunar\":false}"
```

### 궁합 분석 테스트
```powershell
curl.exe -X POST http://localhost:3000/v1/api/fortune/compatibility `
    -H "Content-Type: application/json" `
    -d "{\"user1\":{\"year\":1998,\"month\":2,\"day\":1,\"hour\":14,\"minute\":30,\"isLunar\":false},\"user2\":{\"year\":1995,\"month\":7,\"day\":15,\"hour\":9,\"minute\":0,\"isLunar\":false}}"
```

## 방법 3: 한 줄 명령어 (간단한 테스트)

### 사주 계산
```powershell
curl.exe -X POST http://localhost:3000/v1/api/fortune/calculate -H "Content-Type: application/json" -d "{\"year\":1998,\"month\":2,\"day\":1,\"hour\":14,\"minute\":30,\"isLunar\":false}"
```

## 방법 4: Swagger UI 사용 (가장 쉬움) 🌟

1. 브라우저에서 접속: http://localhost:3000/docs
2. `POST /v1/api/fortune/calculate` 찾기
3. Try it out 클릭
4. 요청 본문 입력:
```json
{
  "year": 1998,
  "month": 2,
  "day": 1,
  "hour": 14,
  "minute": 30,
  "isLunar": false
}
```
5. Execute 클릭

## 예상 응답

### 사주 계산 응답
```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": {
    "heavenlyStems": {
      "year": "甲",
      "month": "乙",
      "day": "丙",
      "hour": "丁"
    },
    "earthlyBranches": {
      "year": "子",
      "month": "丑",
      "day": "寅",
      "hour": "卯"
    },
    "fiveElements": {
      "year": "木",
      "month": "木",
      "day": "火",
      "hour": "火"
    },
    "zodiacSign": "子",
    "animalSign": "쥐"
  }
}
```

### 궁합 분석 응답
```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": {
    "score": 78,
    "level": "high",
    "analysis": {
      "overall": "임시 분석 결과입니다. 실제 로직으로 대체하세요.",
      "strengths": [],
      "weaknesses": [],
      "advice": ""
    },
    "details": {
      "heavenlyStems": 60,
      "earthlyBranches": 65,
      "fiveElements": 70,
      "zodiacSign": 55
    }
  }
}
```

## 주의사항

1. **서버 실행 확인**: Node.js 서버가 `http://localhost:3000`에서 실행 중이어야 합니다
2. **FortuneAPI 서버 실행**: FortuneAPI 서버가 `http://localhost:8000`에서 실행 중이어야 합니다
3. **JSON 형식**: 요청 본문은 반드시 유효한 JSON 형식이어야 합니다
4. **따옴표 이스케이프**: curl.exe 사용 시 JSON의 따옴표를 `\"`로 이스케이프해야 합니다

## 빠른 체크리스트

- [ ] Node.js 서버 실행 중 (`npm run dev`)
- [ ] FortuneAPI 서버 실행 중 (`uvicorn main:app --reload --host 0.0.0.0 --port 8000`)
- [ ] 서버 상태 확인 (`curl http://localhost:3000/docs`)
- [ ] API 테스트 실행

