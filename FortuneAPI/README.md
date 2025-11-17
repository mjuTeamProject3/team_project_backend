# FateTry FortuneAPI

사주 궁합 분석을 위한 Python FastAPI 서버입니다. React Native 앱에서 사용할 수 있는 REST API를 제공합니다.

## 폴더 구조
- `FortuneAPI/` (이 폴더): FastAPI 서버
- `FateTry/FortuneSRC/`: 사주 분석 데이터 및 모델
  - `earth3000.h5`: 지지(地支) 분석 모델
  - `sky3000.h5`: 천간(天干) 분석 모델  
  - `cal.csv`: 음력/양력 변환 캘린더 데이터
  - `hd2.ipynb`: 사주 분석 로직 노트북

## 설치 및 실행

### 1. 가상환경 생성 및 활성화
```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# Windows CMD
.venv\Scripts\activate.bat
# macOS/Linux
source .venv/bin/activate
```

### 2. 의존성 설치
```bash
pip install -r FortuneAPI/requirements.txt
```

**참고**
- `.h5` 모델을 사용하려면 `tensorflow`를 직접 설치해야 합니다.
- 일간(일간지) 계산을 정확히 하려면 환경 변수 `KOREA_LUNAR_API_KEY`에 한국천문연구원 OpenAPI 키를 넣어주세요. 키가 없으면 내부 보정 알고리즘으로 근사합니다.

### 3. 서버 실행
```bash
uvicorn FortuneAPI.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 서버 상태 확인
```bash
curl http://localhost:8000/health
```

## API 엔드포인트

### 1. 사주 계산
**POST** `/fortune/calculate`

**요청 본문:**
```json
{
  "birthInfo": {
    "year": 1998,
    "month": 2,
    "day": 1,
    "isLunar": false,
    "gender": "female"
  }
}
```

**응답:**
```json
{
  "heavenlyStems": {
    "year": "甲",
    "month": "乙", 
    "day": "丙"
  },
  "earthlyBranches": {
    "year": "子",
    "month": "丑",
    "day": "寅"
  },
  "fiveElements": {
    "year": "木",
    "month": "木",
    "day": "火"
  },
  "zodiacSign": "子",
  "animalSign": "쥐"
}
```

### 2. 궁합 분석
**POST** `/fortune/compatibility`

**요청 본문:**
```json
{
  "user1": {
    "birthInfo": {
      "year": 2003,
      "month": 8,
      "day": 16,
      "isLunar": false,
      "gender": "male"
    }
  },
  "user2": {
    "birthInfo": {
      "year": 2003,
      "month": 12,
      "day": 4,
      "isLunar": false,
      "gender": "male"
    }
  }
}
```

**응답:**
```json
{
  "score": 74.5,
  "finalScore": 74.5,
  "originalScore": 82.1,
  "stressScore": 33.8,
  "level": "high",
  "analysis": {
    "overall": "안정적인 호환성입니다. 대화를 자주 나눠보세요.",
    "strengths": ["열정 · 에너지 · 예술 · 중독"],
    "weaknesses": ["무난"],
    "advice": "진짜 로직 연결 전 임시 메시지입니다."
  },
  "details": {
    "skyYear": 51.2,
    "skyDay": 80.3,
    "earthYear": 65.5,
    "earthMonth": 60.1,
    "earthDay": 79.9
  },
  "traits": {
    "user1": ["열정 · 에너지 · 예술 · 중독"],
    "user2": ["무난"]
  }
}
```

## React Native 앱 연동

`FateTry/src/services/FortuneAdapter.ts`에서:
```typescript
import { fortuneAdapter } from '../services/FortuneAdapter';

// 원격 API 모드로 설정
fortuneAdapter.setMode('remote');
fortuneAdapter.setBaseUrl('http://<PC-IP>:8000');
```

## 실제 로직 적용하기

현재 `FortuneAPI/main.py`는 임시 모의 로직을 사용합니다. 실제 사주 분석을 위해서는:

1. `hd2.ipynb`의 로직을 Python 함수로 추출
2. `mock_calculate_fortune`과 `mock_compatibility` 함수를 실제 로직으로 교체
3. `get_resources()`에서 로드된 모델과 캘린더 데이터 활용

## 문제 해결

- **CORS 오류**: 서버가 이미 CORS를 허용하도록 설정되어 있습니다
- **모델 로드 실패**: TensorFlow 버전과 Python 버전을 확인하세요
- **연결 실패**: 방화벽 설정과 IP 주소를 확인하세요
