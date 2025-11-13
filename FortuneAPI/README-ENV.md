# FortuneAPI/.env 파일 생성 가이드

## 빠른 설정 방법

### 방법 1: PowerShell에서 생성 (권장)

FortuneAPI 폴더에서 다음 명령어 실행:

```powershell
# FortuneAPI 폴더로 이동
cd FortuneAPI

# .env 파일 생성 (your-api-key-here를 실제 API 키로 변경)
@"
GOOGLE_API_KEY=your-api-key-here
"@ | Out-File -FilePath .env -Encoding utf8
```

### 방법 2: 텍스트 에디터로 생성

1. FortuneAPI 폴더에서 `.env` 파일 생성 (파일명: `.env`)
2. 다음 내용 입력:
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```
3. `your-api-key-here`를 실제 Gemini API 키로 변경
4. 저장

### 방법 3: 명령 프롬프트에서 생성

```cmd
cd FortuneAPI
echo GOOGLE_API_KEY=your-api-key-here > .env
```

## API 키 예시

```env
GOOGLE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**주의:**
- `=` 앞뒤에 공백 없이 입력
- 따옴표 없이 입력
- 실제 API 키로 변경

## 서버 재시작

.env 파일 생성 후 FortuneAPI 서버 재시작:

```powershell
# FortuneAPI 폴더에서
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 확인

서버 시작 시 오류 메시지가 없으면 정상입니다.

- 정상: 아무 메시지 없음
- 오류: `Warning: GOOGLE_API_KEY is not set.` 또는 `Warning: Failed to configure Gemini API: ...`

