# 프로젝트 아키텍처

## 🏗️ 전체 구조

프로젝트는 계층형 아키텍처를 따르며, 요청은 위에서 아래로, 응답은 아래에서 위로 흐릅니다.

```
Entry Point (index.js)
    ↓
Routing Layer (routes)
    ↓
Business Logic Layer (controllers → services)
    ↓
Data Access Layer (repositories → Prisma ORM)
    ↓
External Database (MySQL)
```

## 📋 계층별 역할

### 1️⃣ 진입점 (Entry Point)

**index.js**: 모든 클라이언트 요청의 최초 진입점

- 애플리케이션의 초기 설정(configurations, middlewares 등)을 로드
- Express 서버 생성 및 미들웨어 설정 (CORS, JSON 파싱, 세션 등)
- WebSocket 서버 초기화
- HTTP/WebSocket 서버 시작

### 2️⃣ 환경설정 및 지원 계층 (Configuration & Supporting)

요청 처리 흐름 전반에 걸쳐 필요한 공통 기능 및 설정을 제공합니다.

**Configuration (configs, middlewares, utils)**:
- **configs**: 데이터베이스 연결 정보, Passport 소셜 로그인, CORS, Swagger 등 핵심 환경 설정
- **middlewares**: 요청/응답 주기에 개입하여 인증(`auth.middleware.js`), 에러 처리(`error.middleware.js`), 상태 관리 등 공통 작업 수행
- **utils**: JWT 토큰 생성/검증, 비밀번호 암호화 등 애플리케이션 전반에서 사용되는 유틸리티 함수

**Supporting (dtos, errors, realtime)**:
- **dtos (Data Transfer Objects)**: 계층 간 데이터 전송 시 사용되는 객체의 형식을 정의 (요청/응답 데이터 구조화)
- **errors**: 커스텀 에러 클래스 및 중앙 집중식 에러 핸들링 로직 관리
- **realtime**: WebSocket을 통한 실시간 통신 모듈 (채팅 매칭, 메시지 전송, 주제 제안 등)

### 3️⃣ 라우팅 계층 (Routing)

**routes**: 클라이언트 요청을 적절한 컨트롤러로 분배

- URI 및 HTTP Method(GET, POST, PUT, DELETE 등)에 따라 요청을 적절한 비즈니스 로직으로 라우팅
- 이 계층은 Configuration 계층의 미들웨어(인증 등)와 Supporting 계층의 dtos를 활용하여 요청 검증 및 처리

**중요**: 일부 라우트는 컨트롤러를 거치지 않고 직접 서비스를 호출하기도 합니다 (예: `message.route.js`).

### 4️⃣ 비즈니스 로직 계층 (Business Logic)

**controllers**: 라우트로부터 요청을 받아 처리하는 인터페이스 계층

- 요청의 유효성 검사(DTO를 통한 데이터 구조 검증)
- 서비스 계층에 필요한 데이터 전달
- 서비스에서 반환된 결과를 받아 HTTP 응답으로 변환
- 에러 발생 시 다음 미들웨어로 전달

**services**: 컨트롤러로부터 전달받은 데이터를 기반으로 실제 비즈니스 로직 수행

- 로그인/회원가입, 친구 요청, 알림 처리 등의 핵심 비즈니스 규칙 구현
- Supporting 계층의 errors를 사용하여 예외 처리 수행
- 데이터 처리 필요 시 Data Access 계층과 통신
- 외부 API 연동 (AI 서비스: OpenAI, Google GenAI)

### 5️⃣ 데이터 접근 계층 (Data Access)

비즈니스 로직과 데이터베이스 간의 상호작용을 추상화합니다.

**repositories**: 서비스 계층의 요청을 받아 데이터베이스 쿼리 실행 로직 캡슐화

- Repository Pattern 구현
- Prisma Client를 사용한 데이터 조회/생성/수정/삭제 로직
- 각 엔티티별로 독립적인 repository 파일 구성

**Prisma ORM**: ORM(Object-Relational Mapping) 도구

- repositories에서 JavaScript 코드를 통해 데이터베이스 조작
- `schema.prisma` 파일에서 데이터 모델 정의
- 타입 안전성과 자동 SQL 생성 제공

### 6️⃣ 외부 데이터베이스 (External Database)

**MySQL**: 애플리케이션의 모든 데이터를 영구적으로 저장하는 최종 저장소

- User, Like, Friendship, Notification, Message 등의 테이블
- Data Access 계층을 통해서만 접근 가능
- Prisma를 통해 연결 및 쿼리 실행

## 🔄 데이터 흐름 (HTTP Request)

1. **클라이언트** → HTTP 요청 생성
2. **index.js** → 서버에 요청 도착, 미들웨어 적용
3. **routes** → URI/Method에 따른 라우팅 결정
4. **middlewares** → 인증, 권한 확인 (필요 시)
5. **controllers** → 요청 데이터 검증 및 서비스 호출
6. **services** → 비즈니스 로직 실행
7. **repositories** → 데이터 접근 요청
8. **Prisma ORM** → SQL 쿼리 생성 및 실행
9. **MySQL** → 데이터 조회/저장 수행
10. 역순으로 응답 반환 (repositories → services → controllers → routes → 클라이언트)

## 🔄 데이터 흐름 (WebSocket)

1. **클라이언트** → WebSocket 연결 요청
2. **index.js** → Socket.IO 서버 초기화
3. **realtime/socket.js** → JWT 토큰 인증
4. **services** → 실시간 기능 실행 (매칭, 채팅, 주제 제안 등)
5. **Prisma** → 필요한 데이터 조회
6. **클라이언트** ← 실시간 이벤트 전송

## 🔗 주요 의존성 관계

```
index.js
  ├─→ configs (db.config, passport.config, cors.config, swagger.config)
  ├─→ middlewares (auth.middleware, error.middleware, state.middleware)
  ├─→ routes (auth.route, user.route, friend.route, etc.)
  └─→ realtime (socket.js)

controllers
  ├─→ services (비즈니스 로직 호출)
  ├─→ dtos (데이터 검증)
  └─→ errors (에러 처리)

services
  ├─→ repositories (데이터 접근)
  ├─→ utils (jwt.util, crypto.util 등)
  ├─→ errors (비즈니스 에러)
  └─→ dtos (데이터 변환)

repositories
  ├─→ configs/db.config (Prisma Client)
  └─→ Prisma → MySQL

realtime
  ├─→ utils (JWT 검증)
  ├─→ services (saju, topic, report 등)
  └─→ Prisma (데이터 조회)
```

## 🎯 설계 원칙

1. **관심사의 분리**: 각 계층은 고유한 책임만 담당
2. **단방향 의존성**: 상위 계층 → 하위 계층으로만 의존
3. **추상화**: Data Access 계층이 데이터베이스 세부사항을 숨김
4. **재사용성**: utils, middlewares는 여러 계층에서 공통 사용
5. **확장성**: 새로운 라우트, 서비스 추가 용이
