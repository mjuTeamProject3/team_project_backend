# Gemini 대화 주제 추천 테스트 스크립트

Write-Host "=== Gemini 대화 주제 추천 테스트 ===" -ForegroundColor Cyan
Write-Host ""

# 1단계: 궁합 분석
Write-Host "[1/2] 궁합 분석 실행 중..." -ForegroundColor Yellow
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

try {
    $compatibility = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/compatibility" `
        -Method Post `
        -ContentType "application/json" `
        -Body $compatibilityBody

    Write-Host "✅ 궁합 분석 성공" -ForegroundColor Green
    Write-Host "   궁합 점수: $($compatibility.success.score)" -ForegroundColor White
    Write-Host "   궁합 등급: $($compatibility.success.level)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ 궁합 분석 실패: $_" -ForegroundColor Red
    exit 1
}

# 2단계: 대화 주제 추천
Write-Host "[2/2] 대화 주제 추천 실행 중..." -ForegroundColor Yellow
$topicsBody = $compatibility.success | ConvertTo-Json -Depth 3

try {
    $topics = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/recommend-topics" `
        -Method Post `
        -ContentType "application/json" `
        -Body $topicsBody `
        -TimeoutSec 60

    Write-Host "✅ 대화 주제 추천 성공" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== 추천된 대화 주제 ===" -ForegroundColor Cyan
    foreach ($topic in $topics.success) {
        Write-Host "주제: $($topic.topic)" -ForegroundColor Yellow
        Write-Host "이유: $($topic.reason)" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "❌ 대화 주제 추천 실패: $_" -ForegroundColor Red
    exit 1
}

Write-Host "=== 테스트 완료 ===" -ForegroundColor Cyan

