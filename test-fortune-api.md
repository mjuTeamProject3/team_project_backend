# Fortune API 테스트 가이드

## 1. 사주 계산 테스트

### curl 명령어
```powershell
curl -X POST http://localhost:3000/v1/api/fortune/calculate `
  -H "Content-Type: application/json" `
  -d '{
    "year": 1998,
    "month": 2,
    "day": 1,
    "isLunar": false,
    "gender": "female"
  }'
```

### 예상 응답
```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": {
    "heavenlyStems": {
      "year": "甲",
      "month": "乙",
      "day": "丙"
    },
    "earthlyBranches": {
      "year": "子",
      "month": "丑",
      "day": "寅"
    },
    "fiveElements": {
      "year": "木",
      "month": "木",
      "day": "火"
    },
    "zodiacSign": "子",
    "animalSign": "쥐"
  }
}
```

## 2. 궁합 분석 테스트

### curl 명령어
```powershell
curl -X POST http://localhost:3000/v1/api/fortune/compatibility `
  -H "Content-Type: application/json" `
  -d '{
    "user1": {
      "year": 1998,
      "month": 2,
      "day": 1,
      "isLunar": false,
      "gender": "female"
    },
    "user2": {
      "year": 1995,
      "month": 7,
      "day": 15,
      "isLunar": false,
      "gender": "male"
    }
  }'
```

### 예상 응답
```json
{
  "resultType": "SUCCESS",
  "error": null,
  "success": {
    "score": 74.5,
    "finalScore": 74.5,
    "originalScore": 82.1,
    "stressScore": 33.8,
    "level": "high",
    "analysis": {
      "overall": "안정적인 호환성입니다. 대화를 자주 나눠보세요.",
      "strengths": ["열정 · 에너지 · 예술 · 중독"],
      "weaknesses": ["무난"],
      "advice": "진짜 로직 연결 전 임시 메시지입니다."
    },
    "details": {
      "skyYear": 51.2,
      "skyDay": 80.3,
      "earthYear": 65.5,
      "earthMonth": 60.1,
      "earthDay": 79.9
    },
    "traits": {
      "user1": ["열정 · 에너지 · 예술 · 중독"],
      "user2": ["무난"]
    }
  }
}
```

## 3. PowerShell에서 테스트

### 사주 계산
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

### 궁합 분석
```powershell
$body = @{
    user1 = @{
        year = 1998
        month = 2
        day = 1
        isLunar = $false
        gender = "female"
    }
    user2 = @{
        year = 1995
        month = 7
        day = 15
        isLunar = $false
        gender = "male"
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/compatibility" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## 4. Postman으로 테스트

1. Postman 실행
2. 새 Request 생성
3. Method: POST
4. URL: `http://localhost:3000/v1/api/fortune/calculate`
5. Headers: `Content-Type: application/json`
6. Body (raw JSON):
```json
{
  "year": 1998,
  "month": 2,
  "day": 1,
  "isLunar": false,
  "gender": "female"
}
```
7. Send 클릭

## 5. 브라우저에서 테스트 (JavaScript)

브라우저 콘솔에서:
```javascript
// 사주 계산
fetch('http://localhost:3000/v1/api/fortune/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    year: 1998,
    month: 2,
    day: 1,
    isLunar: false,
    gender: "female"
  })
})
.then(res => res.json())
.then(data => console.log(data));

// 궁합 분석
fetch('http://localhost:3000/v1/api/fortune/compatibility', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user1: {
      year: 1998,
      month: 2,
      day: 1,
      isLunar: false,
      gender: "female"
    },
    user2: {
      year: 1995,
      month: 7,
      day: 15,
      isLunar: false,
      gender: "male"
    }
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 6. FortuneAPI 서버 확인

FortuneAPI 서버가 실행 중인지 확인:
```powershell
curl http://localhost:8000/health
```

또는 브라우저에서:
```
http://localhost:8000/health
http://localhost:8000/docs
```

