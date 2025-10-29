# OAuth 설정 단계별 가이드

## 📋 필수 준비사항
- 서버 실행 중 (포트 확인: 기본 3000)
- `.env` 파일 존재 확인

---

## 🔵 1. 구글 OAuth 설정

### Step 1: Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Google 계정으로 로그인

### Step 2: 프로젝트 생성
1. 상단 **프로젝트 선택** 클릭
2. **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: `my-team-project`)
4. **만들기** 클릭 → 생성 완료까지 대기

### Step 3: OAuth 동의 화면 설정
1. 좌측 메뉴 → **API 및 서비스** → **OAuth 동의 화면**
2. **외부** 선택 → **만들기**
3. 필수 정보 입력:
   - 앱 이름: `팀프로젝트 백엔드` (원하는 이름)
   - 사용자 지원 이메일: 본인 이메일
   - 앱 로고: 선택사항
4. **저장하고 계속하기** 클릭
5. **범위** 단계: 저장하고 계속
6. **테스트 사용자** 단계: **+ ADD USERS** → 본인 이메일 추가
7. **저장하고 계속하기** 클릭

### Step 4: OAuth 클라이언트 ID 생성
1. 좌측 메뉴 → **API 및 서비스** → **사용자 인증 정보**
2. 상단 **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름 입력: `Backend Social Login`
5. **승인된 리디렉션 URI** → **+ URI 추가**:
   ```
   http://localhost:3000/v1/api/auth/google/callback
   ```
   (포트가 다르면 포트 번호 변경)
6. **만들기** 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사 ⚠️

### Step 5: .env 파일에 추가
`.env` 파일에 다음 내용 추가 (주석 제거):

```env
GOOGLE_CLIENT_ID=발급받은_클라이언트_ID
GOOGLE_CLIENT_SECRET=발급받은_보안_비밀번호
GOOGLE_CALLBACK_URL=http://localhost:3000/v1/api/auth/google/callback
```

---

## 🟡 2. 카카오 OAuth 설정

### Step 1: Kakao Developers 접속
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인

### Step 2: 애플리케이션 추가
1. 상단 **내 애플리케이션** 클릭
2. **애플리케이션 추가하기** 클릭
3. 정보 입력:
   - 앱 이름: `팀프로젝트 백엔드` (원하는 이름)
   - 사업자명: 본인 이름 또는 팀 이름
4. **저장** 클릭

### Step 3: 플랫폼 등록
1. 생성한 앱 선택
2. 좌측 메뉴 → **앱 설정** → **플랫폼**
3. **Web 플랫폼 등록** 클릭
4. 사이트 도메인 입력:
   ```
   http://localhost:3000
   ```
5. **저장** 클릭

### Step 4: 카카오 로그인 활성화
1. 좌측 메뉴 → **제품 설정** → **카카오 로그인**
2. **활성화 설정**을 **ON**으로 변경
3. **Redirect URI** 등록:
   ```
   http://localhost:3000/v1/api/auth/kakao/callback
   ```
4. **저장** 클릭

### Step 5: 동의 항목 설정
1. **동의 항목** 탭 클릭
2. 필수 설정:
   - **닉네임**: 필수 동의
   - **카카오계정(이메일)**: 선택 동의 (이메일 필요 시)
3. **저장** 클릭

### Step 6: Client Secret 생성
1. 좌측 메뉴 → **앱 설정** → **보안**
2. **Client Secret 코드 생성** 클릭
3. **REST API 키**와 **Client Secret** 복사 ⚠️

### Step 7: .env 파일에 추가
`.env` 파일에 다음 내용 추가 (주석 제거):

```env
KAKAO_CLIENT_ID=발급받은_REST_API_키
KAKAO_CLIENT_SECRET=발급받은_Client_Secret
KAKAO_CALLBACK_URL=http://localhost:3000/v1/api/auth/kakao/callback
```

---

## 🟢 3. 네이버 OAuth 설정

### Step 1: Naver Developers 접속
1. [Naver Developers](https://developers.naver.com/) 접속
2. 네이버 계정으로 로그인

### Step 2: 애플리케이션 등록
1. 상단 **Application** → **애플리케이션 등록** 클릭
2. 필수 정보 입력:
   - 애플리케이션 이름: `팀프로젝트 백엔드`
   - 사용 API: **네이버 로그인** 체크
   - 로그인 오픈 API 서비스 환경: **개발용** 선택
   - 서비스 URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/v1/api/auth/naver/callback`
3. **등록하기** 클릭

### Step 3: Client ID와 Secret 확인
1. 등록 완료 후 화면에서 확인:
   - **Client ID** 복사 ⚠️
   - **Client Secret** 복사 ⚠️

### Step 4: .env 파일에 추가
`.env` 파일에 다음 내용 추가 (주석 제거):

```env
NAVER_CLIENT_ID=발급받은_Client_ID
NAVER_CLIENT_SECRET=발급받은_Client_Secret
NAVER_CALLBACK_URL=http://localhost:3000/v1/api/auth/naver/callback
```

---

## ✅ 4. 설정 완료 확인

### Step 1: 서버 재시작
`.env` 파일 수정 후 서버를 재시작하세요:

```bash
# 개발 모드에서 실행 중이면 자동 재시작됩니다
# 또는 Ctrl+C로 중지 후 다시 실행
npm run dev
```

### Step 2: 경고 메시지 확인
서버가 정상적으로 시작되면:
- ✅ 경고 메시지가 사라져야 합니다
- ✅ "Server: http://localhost:3000" 메시지 확인

### Step 3: 테스트
브라우저에서 다음 URL로 접속:

- **구글 로그인**: http://localhost:3000/v1/api/auth/google
- **카카오 로그인**: http://localhost:3000/v1/api/auth/kakao
- **네이버 로그인**: http://localhost:3000/v1/api/auth/naver

각 URL로 접속하면 해당 소셜 로그인 페이지로 리다이렉트되어야 합니다.

---

## 🚨 문제 해결

### 포트가 다른 경우
`.env` 파일의 `PORT` 값과 콜백 URL의 포트를 일치시켜야 합니다.

예: 포트가 8080인 경우
```env
PORT=8080
GOOGLE_CALLBACK_URL=http://localhost:8080/v1/api/auth/google/callback
```

### OAuth 설정 후에도 경고가 나오는 경우
1. `.env` 파일에 값을 정확히 입력했는지 확인
2. 서버 재시작 확인
3. 환경 변수 이름 대소문자 확인 (정확히 일치해야 함)

### 리다이렉트 URI 불일치 오류
- 각 플랫폼의 콜백 URL과 `.env`의 콜백 URL이 정확히 일치해야 합니다
- 마지막 슬래시(/)도 확인하세요

---

## 📝 체크리스트

- [ ] 구글 OAuth 클라이언트 ID/Secret 발급
- [ ] 카카오 REST API 키/Client Secret 발급
- [ ] 네이버 Client ID/Secret 발급
- [ ] `.env` 파일에 모든 값 추가
- [ ] 서버 재시작 완료
- [ ] 브라우저에서 테스트 완료

---

**💡 팁**: 하나씩 설정해도 됩니다. 예를 들어 구글만 먼저 설정하고 테스트한 후, 카카오와 네이버를 추가해도 됩니다.

