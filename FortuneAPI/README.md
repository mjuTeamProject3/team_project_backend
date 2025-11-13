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

**참고**: 실제 .h5 모델을 로드하려면 `requirements.txt`에서 TensorFlow 주석을 해제하고 설치하세요. TensorFlow는 특정 Python 버전과 큰 용량이 필요할 수 있습니다.

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
    "hour": 14,
    "minute": 30,
    "isLunar": false
  }
}
```

**응답:**
```json
{
  "heavenlyStems": {
    "year": "甲",
    "month": "乙", 
    "day": "丙",
    "hour": "丁"
  },
  "earthlyBranches": {
    "year": "子",
    "month": "丑",
    "day": "寅", 
    "hour": "卯"
  },
  "fiveElements": {
    "year": "木",
    "month": "木",
    "day": "火",
    "hour": "火"
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
      "year": 1998,
      "month": 2,
      "day": 1,
      "hour": 14,
      "minute": 30,
      "isLunar": false
    }
  },
  "user2": {
    "birthInfo": {
      "year": 1995,
      "month": 7,
      "day": 15,
      "hour": 9,
      "minute": 0,
      "isLunar": false
    }
  }
}
```

**응답:**
```json
{
  "score": 78,
  "level": "high",
  "analysis": {
    "overall": "좋은 궁합입니다",
    "strengths": ["서로 보완", "안정적"],
    "weaknesses": ["가끔 갈등"],
    "advice": "소통을 통해 극복하세요"
  },
  "details": {
    "heavenlyStems": 70,
    "earthlyBranches": 80,
    "fiveElements": 75,
    "zodiacSign": 85
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
