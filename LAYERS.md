# 계층별 간단 설명

## 1️⃣ Entry Point (진입점)
**역할**: 애플리케이션의 시작점으로 모든 요청을 받아 초기 설정과 미들웨어를 적용  
**index.js**: 모든 요청이 처음 들어오는 곳
- 서버 시작
- 설정 로드
- 미들웨어 적용

## 2️⃣ Configurations (환경설정)
**역할**: 애플리케이션 전반에서 사용되는 공통 설정과 유틸리티를 제공하는 기반 계층  
**configs**: DB 연결, 소셜 로그인 설정  
**middlewares**: 인증, 에러 처리  
**utils**: 암호화, JWT

## 3️⃣ Routing (라우팅)
**역할**: URL과 HTTP 메서드에 따라 요청을 적절한 핸들러로 분배하는 경로 선택 계층  
**routes**: URL에 따라 적절한 컨트롤러로 연결

## 4️⃣ Business Logic (비즈니스 로직)
**역할**: 실제 업무 규칙과 로직을 처리하는 핵심 계층  
**controllers**: 요청 처리, 응답 생성  
**services**: 실제 업무 규칙 실행

## 5️⃣ Data Access (데이터 접근)
**역할**: 데이터베이스와의 상호작용을 추상화하여 비즈니스 로직에서 데이터 조작을 쉽게 하는 계층  
**repositories**: DB 조회/저장 함수  
**Prisma**: JavaScript로 DB 조작

## 6️⃣ External DB (외부 DB)
**역할**: 애플리케이션의 모든 데이터를 영구 저장하는 최종 목적지  
**MySQL**: 실제 데이터 저장소

## 7️⃣ Supporting (지원)
**역할**: 여러 계층에서 공통으로 사용되는 지원 기능들을 모아둔 보조 계층  
**dtos**: 데이터 형식 정의  
**errors**: 에러 처리  
**realtime**: 실시간 채팅

---

## 데이터 흐름

### HTTP Request
```
클라이언트 → index.js → routes → controllers → services → repositories → Prisma → MySQL
                                                                              ↓
클라이언트 ← 응답
```

### 구성 요소의 실제 사용
- **configs**: index.js, routes, controllers에서 직접 사용
- **middlewares**: index.js에서 전역 적용, routes에서 필요 시 적용
- **utils**: services, controllers, realtime에서 사용
- **dtos**: controllers, services에서 데이터 검증/변환에 사용
- **errors**: controllers, services에서 에러 처리에 사용
- **realtime**: index.js에서 초기화, 독립적으로 동작

