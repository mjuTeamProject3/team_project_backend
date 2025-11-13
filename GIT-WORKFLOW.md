# Git 커밋 및 PR 올리는 방법

## 1. 현재 상태 확인

### 현재 브랜치 확인
```powershell
git branch
```

### 변경된 파일 확인
```powershell
git status
```

### 원격 저장소 확인
```powershell
git remote -v
```

## 2. 새 브랜치 생성 (필요한 경우)

### 현재 브랜치 확인
```powershell
git branch
```

### 새 브랜치 생성 및 전환
```powershell
# main 브랜치에서 새 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/fortune-api-integration

# 또는 최신 Git 명령어
git switch main
git pull origin main
git switch -c feature/fortune-api-integration
```

## 3. 변경사항 스테이징

### 모든 변경사항 추가
```powershell
git add .
```

### 특정 파일만 추가
```powershell
git add src/utils/fortune.util.js
git add src/services/fortune.service.js
git add src/controllers/fortune.controller.js
git add src/routes/fortune.route.js
git add src/dtos/fortune.dto.js
git add src/configs/fortune.config.js
git add FortuneAPI/main.py
```

### 변경사항 확인
```powershell
git status
```

## 4. 커밋

### 커밋 메시지 작성
```powershell
git commit -m "feat: FortuneAPI 통합 및 사주 로직 구현

- FortuneAPI와 Node.js 백엔드 통합
- 사주 계산 API 엔드포인트 구현
- 궁합 분석 API 엔드포인트 구현
- OpenAI/GenAI 설정을 선택적으로 변경
- FortuneAPI 경로 수정 (FortuneSRC 직접 참조)"
```

### 간단한 커밋 메시지
```powershell
git commit -m "feat: FortuneAPI 통합"
```

## 5. 원격 저장소에 푸시

### 첫 푸시 (브랜치 생성)
```powershell
git push -u origin feature/fortune-api-integration
```

### 이후 푸시
```powershell
git push
```

## 6. GitHub에서 PR 생성

### 방법 1: GitHub 웹사이트에서

1. GitHub 저장소로 이동
2. "Compare & pull request" 버튼 클릭 (자동으로 나타날 수 있음)
3. PR 제목 작성:
   ```
   feat: FortuneAPI 통합 및 사주 로직 구현
   ```
4. PR 설명 작성:
   ```markdown
   ## 변경사항
   - FortuneAPI와 Node.js 백엔드 통합
   - 사주 계산 API 엔드포인트 구현 (`POST /v1/api/fortune/calculate`)
   - 궁합 분석 API 엔드포인트 구현 (`POST /v1/api/fortune/compatibility`)
   - OpenAI/GenAI 설정을 선택적으로 변경 (API 키 없이도 서버 실행 가능)
   - FortuneAPI 경로 수정 (FortuneSRC 직접 참조)
   
   ## 테스트
   - [x] FortuneAPI 서버 실행 확인
   - [x] 사주 계산 API 테스트
   - [x] 궁합 분석 API 테스트
   - [x] Swagger UI에서 테스트
   
   ## 관련 이슈
   - #이슈번호 (있다면)
   ```
5. 리뷰어 지정 (필요한 경우)
6. "Create pull request" 클릭

### 방법 2: GitHub CLI 사용

```powershell
# GitHub CLI 설치 필요
gh pr create --title "feat: FortuneAPI 통합" --body "FortuneAPI와 Node.js 백엔드 통합"
```

## 7. 전체 워크플로우 요약

```powershell
# 1. 현재 상태 확인
git status
git branch

# 2. 새 브랜치 생성 (필요한 경우)
git checkout main
git pull origin main
git checkout -b feature/fortune-api-integration

# 3. 변경사항 스테이징
git add .

# 4. 커밋
git commit -m "feat: FortuneAPI 통합 및 사주 로직 구현"

# 5. 원격 저장소에 푸시
git push -u origin feature/fortune-api-integration

# 6. GitHub에서 PR 생성
# 브라우저에서 GitHub 저장소로 이동 후 PR 생성
```

## 8. 커밋 메시지 컨벤션

### 일반적인 형식
```
<type>: <subject>

<body>

<footer>
```

### Type 종류
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드 업무 수정

### 예시
```powershell
# 기능 추가
git commit -m "feat: FortuneAPI 통합"

# 버그 수정
git commit -m "fix: OpenAI 설정 오류 수정"

# 문서 수정
git commit -m "docs: API 사용법 추가"

# 리팩토링
git commit -m "refactor: Fortune 서비스 로직 개선"
```

## 9. PR 작성 팁

### 좋은 PR 제목
- 명확하고 간결하게
- 변경사항을 한눈에 알 수 있게
- 예: "feat: FortuneAPI 통합 및 사주 로직 구현"

### 좋은 PR 설명
- 변경사항 요약
- 테스트 방법
- 스크린샷 (필요한 경우)
- 관련 이슈 링크
- 체크리스트

### 예시 PR 설명
```markdown
## 변경사항
- FortuneAPI와 Node.js 백엔드 통합
- 사주 계산 및 궁합 분석 API 구현
- OpenAI/GenAI 설정을 선택적으로 변경

## 테스트
- [x] FortuneAPI 서버 실행 확인
- [x] 사주 계산 API 테스트
- [x] 궁합 분석 API 테스트
- [x] Swagger UI에서 테스트

## 스크린샷
(필요한 경우)

## 관련 이슈
- #123
```

## 10. 문제 해결

### 충돌 해결
```powershell
# 원격 저장소의 최신 변경사항 가져오기
git fetch origin
git merge origin/main

# 충돌 해결 후
git add .
git commit -m "merge: 충돌 해결"
git push
```

### 커밋 수정
```powershell
# 마지막 커밋 메시지 수정
git commit --amend -m "수정된 커밋 메시지"

# 강제 푸시 (주의!)
git push --force
```

### 커밋 취소
```powershell
# 마지막 커밋 취소 (변경사항 유지)
git reset --soft HEAD~1

# 마지막 커밋 취소 (변경사항 삭제)
git reset --hard HEAD~1
```

## 11. 체크리스트

PR 올리기 전 확인사항:
- [ ] 코드가 정상 작동하는지 확인
- [ ] 테스트 통과 확인
- [ ] 불필요한 파일 제거 (node_modules, .env 등)
- [ ] .gitignore 확인
- [ ] 커밋 메시지 작성
- [ ] PR 설명 작성
- [ ] 리뷰어 지정

## 12. 현재 작업한 파일들

### 추가된 파일
- `src/configs/fortune.config.js`
- `src/utils/fortune.util.js`
- `src/services/fortune.service.js`
- `src/controllers/fortune.controller.js`
- `src/routes/fortune.route.js`
- `src/dtos/fortune.dto.js`

### 수정된 파일
- `FortuneAPI/main.py` (경로 수정)
- `src/configs/openai.config.js` (선택적 초기화)
- `src/configs/genai.config.js` (선택적 초기화)
- `src/utils/openai.util.js` (에러 처리 추가)
- `src/utils/genai.util.js` (에러 처리 추가)
- `src/services/user.service.js` (import 추가)
- `src/routes/index.route.js` (fortune route 추가)
- `.gitignore` (Python 관련 항목 추가)

### 문서 파일 (선택사항)
- `test-fortune-api.md`
- `README-SERVER.md`
- `QUICK-TEST.md`
- `test-curl-commands.ps1`
- `GIT-WORKFLOW.md`

