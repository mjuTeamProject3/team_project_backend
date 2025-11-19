# API 엔드포인트 목록

모든 엔드포인트는 `/v1/api/` 접두사를 사용합니다.

## 🔐 인증 (Auth)

### 소셜 로그인
- `GET /v1/api/auth/google` - 구글 소셜 로그인 시작
- `GET /v1/api/auth/google/callback` - 구글 로그인 콜백
- `GET /v1/api/auth/google/error` - 구글 로그인 에러 페이지
- `GET /v1/api/auth/kakao` - 카카오 소셜 로그인 시작
- `GET /v1/api/auth/kakao/callback` - 카카오 로그인 콜백
- `GET /v1/api/auth/kakao/error` - 카카오 로그인 에러 페이지
- `GET /v1/api/auth/naver` - 네이버 소셜 로그인 시작
- `GET /v1/api/auth/naver/callback` - 네이버 로그인 콜백
- `GET /v1/api/auth/naver/error` - 네이버 로그인 에러 페이지

### 인증 관리
- `POST /v1/api/auth/setup` - 소셜 로그인 후 프로필 설정 및 토큰 발급
- `POST /v1/api/auth/signout` - 로그아웃 (인증 필요)
- `POST /v1/api/auth/refresh` - Access Token 갱신
- `GET /v1/api/auth/protected` - 인증 상태 확인 (인증 필요)

## 👤 사용자 (User)

- `GET /v1/api/user` - 현재 사용자 프로필 조회 (인증 필요)
- `GET /v1/api/user/:id` - 특정 사용자 프로필 조회 (인증 필요)
- `PUT /v1/api/user/profile` - 프로필 수정 (인증 필요)
- `POST /v1/api/user/:id/like` - 사용자 좋아요 (인증 필요)
- `DELETE /v1/api/user/:id/like` - 사용자 좋아요 취소 (인증 필요)

## 👥 친구 (Friend)

- `POST /v1/api/friend/request/:id` - 친구 요청 (인증 필요)
- `POST /v1/api/friend/accept/:id` - 친구 요청 수락 (인증 필요)
- `POST /v1/api/friend/decline/:id` - 친구 요청 거절 (인증 필요)

## 🔔 알림 (Notification)

- `GET /v1/api/notification` - 알림 목록 조회
- `PATCH /v1/api/notification/:notifId/read` - 알림 읽음 처리
- `PATCH /v1/api/notification/:notifId/friend-request/process` - 친구 요청 알림 처리

## 💬 메시지 (Message)

- `POST /v1/api/message` - 메시지 전송
- `GET /v1/api/message/:partnerId` - 특정 사용자와의 채팅 내역 조회

## 📊 랭킹 (Ranking)

- `GET /v1/api/ranking/overall` - 전체 랭킹
- `GET /v1/api/ranking/monthly` - 월간 랭킹
- `GET /v1/api/ranking/local` - 지역별 랭킹

## 📤 파일 업로드 (Upload)

- `POST /v1/api/upload/image` - 이미지 업로드

## 🔮 사주/운세 (Fortune)

- `POST /v1/api/fortune/calculate` - 사주 계산
- `POST /v1/api/fortune/compatibility` - 궁합 분석
- `POST /v1/api/fortune/recommend-topics` - 대화 주제 추천

## 🧪 테스트 (Test)

- `GET /v1/api/test/gemini` - Gemini API 테스트
- `GET /v1/api/test/openai` - OpenAI API 테스트
- `GET /v1/api/test/jwt` - JWT 토큰 생성 (개발용)

## 📚 기타

- `GET /docs` - Swagger UI 문서
- `GET /openapi.json` - OpenAPI 스펙 JSON
- `GET /auth/callback` - 소셜 로그인 콜백 페이지 (HTML)
- `GET /auth/setup` - 프로필 설정 페이지 (HTML)

---

## 인증 필요 여부

- ✅ **인증 필요**: `verifyAccessToken` 미들웨어가 적용된 엔드포인트
- ❌ **인증 불필요**: 공개 엔드포인트

## 요청 형식

### 인증이 필요한 요청
```
Authorization: Bearer <access_token>
```

### Content-Type
- JSON 요청: `application/json`
- 파일 업로드: `multipart/form-data`

