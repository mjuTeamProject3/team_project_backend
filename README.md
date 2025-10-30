# team_project_backend
팀프 3조 백엔드

## 소셜 로그인 OAuth 설정 가이드

### 1. 구글 OAuth 설정

#### 1.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** > **사용자 인증 정보**로 이동
4. **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID** 선택
5. **애플리케이션 유형**: 웹 애플리케이션
6. **승인된 리디렉션 URI**에 추가:
   ```
   http://localhost:YOUR_PORT/v1/api/auth/google/callback
   ```
   (실제 배포 시에는 실제 도메인으로 변경)
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

#### 1.2 OAuth 동의 화면 설정
1. **OAuth 동의 화면** 메뉴로 이동
2. 필요한 정보 입력 (앱 이름, 사용자 지원 이메일 등)
3. 테스트 사용자 추가 (테스트 단계에서는 필요)

---

### 2. 카카오 OAuth 설정

#### 2.1 Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속 후 로그인
2. **내 애플리케이션** > **애플리케이션 추가하기**
3. 앱 이름, 사업자명 입력 후 생성

#### 2.2 플랫폼 설정
1. 생성한 앱 선택 후 **앱 설정** > **플랫폼** 메뉴로 이동
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인 입력:
   ```
   http://localhost:YOUR_PORT
   ```
   (실제 배포 시에는 실제 도메인)

#### 2.3 카카오 로그인 활성화
1. **제품 설정** > **카카오 로그인** 메뉴로 이동
2. **활성화 설정**을 **ON**으로 변경
3. **Redirect URI** 등록:
   ```
   http://localhost:YOUR_PORT/v1/api/auth/kakao/callback
   ```
4. **동의 항목** 설정:
   - 닉네임 (필수)
   - 카카오계정(이메일) (선택, 이메일 수집 필요 시)
5. **REST API 키**와 **Client Secret** 확인:
   - REST API 키 = 클라이언트 ID
   - 보안 > Client Secret 생성 후 복사

---

### 3. 네이버 OAuth 설정

#### 3.1 Naver Developers 설정
1. [Naver Developers](https://developers.naver.com/) 접속 후 로그인
2. **Application** > **애플리케이션 등록** 클릭
3. 필요한 정보 입력:
   - 애플리케이션 이름
   - 사용 API: 네이버 로그인 (필수)
   - 로그인 오픈 API 서비스 환경: 개발용 (로컬), 서비스용 (운영)
   - 서비스 URL: `http://localhost:YOUR_PORT`
   - Callback URL: `http://localhost:YOUR_PORT/v1/api/auth/naver/callback`
4. 등록 완료 후 **Client ID**와 **Client Secret** 확인

#### 3.2 서비스 약관 동의 (선택)
- 필요 시 네이버 로그인 서비스 약관에 동의

---

### 4. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 포트 설정
PORT=3000

# 데이터베이스
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT 설정
JWT_SECRET=your_jwt_secret_key
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# 프론트엔드 URL (소셜 로그인 리다이렉트용)
FRONTEND_URL=http://localhost:3000

# 구글 OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/v1/api/auth/google/callback

# 카카오 OAuth
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_CALLBACK_URL=http://localhost:3000/v1/api/auth/kakao/callback

# 네이버 OAuth
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_CALLBACK_URL=http://localhost:3000/v1/api/auth/naver/callback
```

---

### 5. 데이터베이스 마이그레이션

소셜 로그인을 위한 스키마 변경사항을 적용하려면:

```bash
npm run migrate
```

---

### 6. API 엔드포인트

소셜 로그인은 다음 엔드포인트를 통해 사용할 수 있습니다:

- **구글 로그인**: `GET /v1/api/auth/google`
- **카카오 로그인**: `GET /v1/api/auth/kakao`
- **네이버 로그인**: `GET /v1/api/auth/naver`

각 엔드포인트로 접속하면 해당 소셜 로그인 페이지로 리다이렉트됩니다.

---

### 7. 프론트엔드 연동

소셜 로그인 완료 후 프론트엔드로 리다이렉트되며, URL에 토큰이 포함됩니다:

```
http://localhost:3000/auth/callback?accessToken=xxx&refreshToken=xxx
```

프론트엔드에서 이 토큰을 저장하고 이후 API 요청 시 `Authorization` 헤더에 포함하면 됩니다:

```
Authorization: Bearer {accessToken}
```

---

### 8. 주의사항

1. **로컬 개발**:
   - 모든 콜백 URL은 `http://localhost:YOUR_PORT` 형식으로 설정
   - 실제 포트 번호 확인 필요

2. **프로덕션 배포**:
   - 실제 도메인으로 리다이렉트 URI 변경
   - HTTPS 필수 (대부분의 OAuth 제공자 요구사항)

3. **보안**:
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - Client Secret은 외부에 노출되지 않도록 주의

4. **테스트**:
   - 각 플랫폼의 테스트 모드 설정 확인
   - 테스트 사용자 추가 (구글의 경우)

## 시작하기

### 1. 환경 변수 설정 (.env 파일 생성)

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 포트 설정 (필수)
PORT=3000

# 데이터베이스 연결 정보 (필수)
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT 설정 (필수)
JWT_SECRET=your_jwt_secret_key_change_this_in_production
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# 프론트엔드 URL (소셜 로그인 리다이렉트용)
FRONTEND_URL=http://localhost:3000

# 구글 OAuth 설정 (선택사항 - 소셜 로그인 사용 시)
# GOOGLE_CLIENT_ID=your_google_client_id_here
# GOOGLE_CLIENT_SECRET=your_google_client_secret_here
# GOOGLE_CALLBACK_URL=http://localhost:3000/v1/api/auth/google/callback

# 카카오 OAuth 설정 (선택사항 - 소셜 로그인 사용 시)
# KAKAO_CLIENT_ID=your_kakao_rest_api_key_here
# KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
# KAKAO_CALLBACK_URL=http://localhost:3000/v1/api/auth/kakao/callback

# 네이버 OAuth 설정 (선택사항 - 소셜 로그인 사용 시)
# NAVER_CLIENT_ID=your_naver_client_id_here
# NAVER_CLIENT_SECRET=your_naver_client_secret_here
# NAVER_CALLBACK_URL=http://localhost:3000/v1/api/auth/naver/callback

# OpenAI API 설정 (선택사항 - AI 기능 사용 시)
# OPENAI_API_KEY=your_openai_api_key_here

# Google GenAI API 설정 (선택사항 - AI 기능 사용 시)
# GOOGLE_API_KEY=your_google_api_key_here
```

**주의**: `.env` 파일은 Git에 커밋되지 않습니다. 실제 값은 직접 입력하세요.

### 2. 데이터베이스 마이그레이션

```bash
npm run migrate
```

### 3. 서버 실행

```bash
# 개발 모드 (권장)
npm run dev

# 프로덕션 모드
npm start
```

---

## 소셜 로그인 OAuth 설정 가이드

#### 구글 로그인 에러
- OAuth 동의 화면에서 테스트 사용자 등록 확인
- 리다이렉트 URI가 정확히 일치하는지 확인

#### 카카오 로그인 에러
- 플랫폼에 Web 플랫폼 등록 확인
- Redirect URI가 정확히 일치하는지 확인
- 동의 항목에서 필요한 정보 요청 확인

#### 네이버 로그인 에러
- Callback URL이 정확히 일치하는지 확인
- 서비스 URL이 올바르게 설정되었는지 확인

#### 일반적인 문제
- 포트 번호 확인 (서버 포트와 콜백 URL 포트 일치)
- 환경 변수 이름 대소문자 확인
- 서버 재시작 확인