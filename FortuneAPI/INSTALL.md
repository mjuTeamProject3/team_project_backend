# FortuneAPI 설치 및 실행 가이드

## 문제: uvicorn이 인식되지 않을 때

### 해결 방법

#### 방법 1: Python 모듈로 실행 (권장 - PATH 문제 없음)

```powershell
# FortuneAPI 폴더에서
cd FortuneAPI

# 의존성 설치
pip install -r requirements.txt

# 서버 실행 (Python 모듈로 실행)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 방법 1-1: Conda base 환경에 직접 설치 (uvicorn이 PATH에 있을 때)

```powershell
# FortuneAPI 폴더에서
cd FortuneAPI

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 방법 2: Python 가상환경 사용 (권장)

```powershell
# FortuneAPI 폴더에서
cd FortuneAPI

# 1. 가상환경 생성
python -m venv .venv

# 2. 가상환경 활성화 (PowerShell)
.venv\Scripts\Activate.ps1

# 만약 실행 정책 오류가 나면:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. 의존성 설치
pip install -r requirements.txt

# 4. 서버 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 방법 3: 프로젝트 루트에서 실행

```powershell
# 프로젝트 루트에서
cd ..

# 의존성 설치 (FortuneAPI 폴더 기준)
pip install -r FortuneAPI/requirements.txt

# 서버 실행 (프로젝트 루트에서)
uvicorn FortuneAPI.main:app --reload --host 0.0.0.0 --port 8000
```

## 실행 위치에 따른 명령어 차이

### FortuneAPI 폴더에서 실행 (권장)
```powershell
# Python 모듈로 실행 (PATH 문제 없음)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 또는 uvicorn 직접 실행 (PATH에 있을 때)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 프로젝트 루트에서 실행
```powershell
# Python 모듈로 실행
python -m uvicorn FortuneAPI.main:app --reload --host 0.0.0.0 --port 8000

# 또는 uvicorn 직접 실행
uvicorn FortuneAPI.main:app --reload --host 0.0.0.0 --port 8000
```

## 환경변수 설정 (선택사항)

### FortuneAPI/.env 파일 생성
```env
GOOGLE_API_KEY=your-google-api-key
```

## 서버 실행 확인

### 서버 상태 확인
```powershell
# 서버 실행 후
curl http://localhost:8000/health

# 또는 브라우저에서
# http://localhost:8000/health
# http://localhost:8000/docs
```

## 문제 해결

### 1. uvicorn이 인식되지 않을 때
- `pip install -r requirements.txt` 실행
- 가상환경이 활성화되어 있는지 확인
- **Python 모듈로 실행** (권장):
  ```powershell
  # FortuneAPI 폴더에서
  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
- 또는 PATH에 추가:
  ```powershell
  # Python Scripts 폴더를 PATH에 추가
  $env:Path += ";C:\Users\ckc03\AppData\Roaming\Python\Python312\Scripts"
  ```

### 2. 실행 정책 오류 (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. 포트가 이미 사용 중일 때
```powershell
# 다른 포트 사용
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### 4. 의존성 설치 오류
```powershell
# Python 버전 확인
python --version

# pip 업그레이드
python -m pip install --upgrade pip

# 의존성 재설치
pip install -r requirements.txt
```

