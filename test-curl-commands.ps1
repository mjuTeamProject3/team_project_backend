# Fortune API 테스트 명령어 모음

# ============================================
# 방법 1: Invoke-RestMethod 사용 (가장 쉬움)
# ============================================

# 1. 사주 계산 테스트
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

# 2. 궁합 분석 테스트
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

# ============================================
# 방법 2: curl.exe 사용 (실제 curl)
# ============================================

# 1. 사주 계산 테스트 (한 줄)
curl.exe -X POST http://localhost:3000/v1/api/fortune/calculate -H "Content-Type: application/json" -d "{\"year\":1998,\"month\":2,\"day\":1,\"isLunar\":false,\"gender\":\"female\"}"

# 2. 사주 계산 테스트 (여러 줄)
curl.exe -X POST http://localhost:3000/v1/api/fortune/calculate `
    -H "Content-Type: application/json" `
    -d "{\"year\":1998,\"month\":2,\"day\":1,\"isLunar\":false,\"gender\":\"female\"}"

# 3. 궁합 분석 테스트 (한 줄)
curl.exe -X POST http://localhost:3000/v1/api/fortune/compatibility -H "Content-Type: application/json" -d "{\"user1\":{\"year\":1998,\"month\":2,\"day\":1,\"isLunar\":false,\"gender\":\"female\"},\"user2\":{\"year\":1995,\"month\":7,\"day\":15,\"isLunar\":false,\"gender\":\"male\"}}"

# ============================================
# 방법 3: 파일에서 JSON 읽기
# ============================================

# request.json 파일 생성 후
# curl.exe -X POST http://localhost:3000/v1/api/fortune/calculate -H "Content-Type: application/json" -d "@request.json"

