# 서버 실행 가이드

## Prisma 클라이언트 생성 오류 해결

### 오류 메시지
```
Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
```

### 해결 방법

#### 방법 1: 개발 모드 사용 (권장)
```powershell
npm run dev
```
- `prisma generate`가 자동으로 실행됩니다
- 파일 변경 시 자동 재시작됩니다

#### 방법 2: 수동으로 Prisma 클라이언트 생성
```powershell
# 1. Prisma 클라이언트 생성
npx prisma generate

# 2. 서버 실행
npm start
```

#### 방법 3: Prisma 스크립트 추가
`package.json`에 다음 스크립트 추가:
```json
{
  "scripts": {
    "generate": "prisma generate",
    "start": "prisma generate && node src/index.js"
  }
}
```

## 환경변수 설정

### 최소 설정 (Fortune API만 테스트)
`.env` 파일 생성:
```env
PORT=3000
FORTUNE_API_URL=http://localhost:8000
```

### 전체 설정 (인증/유저 API 포함)
`.env` 파일 생성:
```env
PORT=3000
FORTUNE_API_URL=http://localhost:8000
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
JWT_SECRET=your-secret-key
```

## 서버 실행 순서

### 1. FortuneAPI 서버 실행
```powershell
# FortuneAPI 폴더에서
cd FortuneAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Node.js 백엔드 서버 실행
```powershell
# 프로젝트 루트에서
npm run dev
```

### 3. 서버 확인
- Node.js 백엔드: http://localhost:3000
- FortuneAPI: http://localhost:8000
- Swagger UI: http://localhost:3000/docs

## 문제 해결

### 1. Prisma 클라이언트 생성 오류
- `npx prisma generate` 실행
- `npm run dev` 사용 (자동 생성)

### 2. 데이터베이스 연결 오류
- Fortune API만 테스트: DATABASE_URL 불필요
- 인증/유저 API 테스트: DATABASE_URL 필요

### 3. FortuneAPI 연결 오류
- FortuneAPI 서버 실행 확인
- `.env` 파일에 `FORTUNE_API_URL` 설정 확인

## 테스트

### Swagger UI로 테스트
1. http://localhost:3000/docs 접속
2. Fortune API 엔드포인트 선택
3. Try it out 클릭
4. 요청 본문 입력
5. Execute 클릭

### curl로 테스트
```powershell
# 사주 계산
curl -X POST http://localhost:3000/v1/api/fortune/calculate `
  -H "Content-Type: application/json" `
  -d '{"year":1998,"month":2,"day":1,"isLunar":false,"gender":"female"}'

# 궁합 분석
curl -X POST http://localhost:3000/v1/api/fortune/compatibility `
  -H "Content-Type: application/json" `
  -d '{"user1":{"year":1998,"month":2,"day":1,"isLunar":false,"gender":"female"},"user2":{"year":1995,"month":7,"day":15,"isLunar":false,"gender":"male"}}'
```

