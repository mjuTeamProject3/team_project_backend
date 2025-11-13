# Gemini 대화 주제 추천 빠른 테스트

Write-Host "=== Gemini 대화 주제 추천 빠른 테스트 ===" -ForegroundColor Cyan
Write-Host ""

# 방법 1: 직접 테스트 (예시 데이터 사용)
Write-Host "[방법 1] 직접 테스트 (예시 데이터)" -ForegroundColor Yellow
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

try {
    Write-Host "요청 중..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "http://localhost:3000/v1/api/fortune/recommend-topics" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 60
    
    Write-Host "✅ 성공!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== 추천된 대화 주제 ===" -ForegroundColor Cyan
    foreach ($topic in $response.success) {
        Write-Host "주제: $($topic.topic)" -ForegroundColor Yellow
        Write-Host "이유: $($topic.reason)" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "❌ 실패: $_" -ForegroundColor Red
    Write-Host "상세 오류: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 테스트 완료 ===" -ForegroundColor Cyan

