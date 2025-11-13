# Gemini 모델 정보

## 현재 사용 중인 모델

**기본 모델: `gemini-2.5-flash`**

Gemini 2.5 Flash는 2025년 6월에 안정 버전으로 출시된 최신 Flash 모델입니다.

## 모델 우선순위

FortuneAPI는 다음 순서로 모델을 시도합니다:

1. **gemini-2.5-flash** (기본값, 최신 안정 버전)
2. gemini-2.0-flash-exp (실험적 2.0 Flash 모델)
3. gemini-1.5-flash (1.5 Flash 모델, 구버전)
4. gemini-1.5-pro (1.5 Pro 모델)
5. gemini-pro (기본 모델, v1 API)

## 모델 지정 방법

### 방법 1: 환경변수로 지정 (권장)

프로젝트 루트의 `.env` 파일에 추가:

```env
GEMINI_MODEL_NAME=gemini-2.5-flash
```

### 방법 2: 코드에서 자동 선택

환경변수가 없으면 자동으로 사용 가능한 모델을 찾아서 사용합니다.

## 모델별 특징

### gemini-2.5-flash (권장)
- **최신 안정 버전** (2025년 6월 출시)
- 빠른 응답 속도
- 향상된 성능
- 다양한 기능 지원

### gemini-2.0-flash-exp
- 실험적 버전
- 최신 기능 테스트
- 안정성 보장 안 됨

### gemini-1.5-flash
- 구버전
- 안정적이지만 구식
- 404 오류 발생 가능

### gemini-1.5-pro
- Pro 버전
- 더 정확한 결과
- 느린 응답 속도

### gemini-pro
- 기본 모델
- 가장 안정적
- v1 API 사용
- 느린 응답 속도

## 문제 해결

### 1. 404 오류 발생 시

모델이 지원되지 않으면 자동으로 다음 모델로 시도합니다:
- `gemini-2.5-flash` → `gemini-2.0-flash-exp` → `gemini-1.5-flash` → `gemini-1.5-pro` → `gemini-pro`

### 2. 특정 모델 사용하고 싶을 때

`.env` 파일에 모델 이름 지정:

```env
GEMINI_MODEL_NAME=gemini-2.5-flash
```

### 3. 모든 모델이 실패할 때

1. API 키 확인
2. Google AI Studio에서 모델 사용 가능 여부 확인
3. 서버 로그 확인

## 참고

- Google AI Studio: https://aistudio.google.com/app/apikey
- Gemini API 문서: https://ai.google.dev/docs
- 모델 목록: https://ai.google.dev/gemini-api/docs/models/gemini

