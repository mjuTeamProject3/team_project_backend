from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional, Dict, Any
from gemini_service import recommend_topics
import os

# Optional heavy deps (TensorFlow, pandas, etc.)
tf = None
pd = None
try:
    import tensorflow as _tf  # type: ignore
    tf = _tf
except Exception:
    tf = None

try:
    import pandas as _pd  # type: ignore
    pd = _pd
except Exception:
    pd = None


FORTUNE_SRC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'FortuneSRC')
EARTH_MODEL_PATH = os.path.join(FORTUNE_SRC_DIR, 'earth3000.h5')
SKY_MODEL_PATH = os.path.join(FORTUNE_SRC_DIR, 'sky3000.h5')
CAL_CSV_PATH = os.path.join(FORTUNE_SRC_DIR, 'cal.csv')


class BirthInfo(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    isLunar: bool


class FortuneInfo(BaseModel):
    heavenlyStems: Dict[str, str]
    earthlyBranches: Dict[str, str]
    fiveElements: Dict[str, str]
    zodiacSign: str
    animalSign: str


class UserPayload(BaseModel):
    birthInfo: BirthInfo


class CompatibilityResult(BaseModel):
    score: int
    level: Literal['very_high', 'high', 'medium', 'low', 'very_low']
    analysis: Dict[str, Any]
    details: Dict[str, int]


app = FastAPI(title='FateTry Fortune API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def load_models_once():
    """Lazy load models if available. Returns a dict of resources."""
    resources = {}
    if tf is not None and os.path.exists(EARTH_MODEL_PATH) and os.path.exists(SKY_MODEL_PATH):
        try:
            resources['earth_model'] = tf.keras.models.load_model(EARTH_MODEL_PATH)
            resources['sky_model'] = tf.keras.models.load_model(SKY_MODEL_PATH)
        except Exception:
            # Fallback: skip loading if incompatible
            resources['earth_model'] = None
            resources['sky_model'] = None
    else:
        resources['earth_model'] = None
        resources['sky_model'] = None

    if pd is not None and os.path.exists(CAL_CSV_PATH):
        try:
            resources['calendar'] = pd.read_csv(CAL_CSV_PATH)
        except Exception:
            resources['calendar'] = None
    else:
        resources['calendar'] = None

    return resources


RESOURCES = None  # lazy cache


def get_resources():
    global RESOURCES
    if RESOURCES is None:
        RESOURCES = load_models_once()
    return RESOURCES


def mock_calculate_fortune(birth: BirthInfo) -> FortuneInfo:
    # Placeholder logic: replace with your real algorithm using RESOURCES
    stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    elem_by_stem = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']

    hs = {
        'year': stems[birth.year % 10],
        'month': stems[birth.month % 10],
        'day': stems[birth.day % 10],
        'hour': stems[birth.hour % 10],
    }
    eb = {
        'year': branches[birth.year % 12],
        'month': branches[birth.month % 12],
        'day': branches[birth.day % 12],
        'hour': branches[birth.hour % 12],
    }
    fe = {
        'year': elem_by_stem[birth.year % 10],
        'month': elem_by_stem[birth.month % 10],
        'day': elem_by_stem[birth.day % 10],
        'hour': elem_by_stem[birth.hour % 10],
    }
    zodiac = eb['year']
    animals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']
    animal = animals[birth.year % 12]

    return FortuneInfo(
        heavenlyStems=hs,
        earthlyBranches=eb,
        fiveElements=fe,
        zodiacSign=zodiac,
        animalSign=animal,
    )


def mock_compatibility(f1: FortuneInfo, f2: FortuneInfo) -> CompatibilityResult:
    base = 50
    bonus = 0
    if f1.fiveElements['day'] != f2.fiveElements['day']:
        bonus += 15
    if f1.earthlyBranches['day'] != f2.earthlyBranches['day']:
        bonus += 10
    if f1.zodiacSign == f2.zodiacSign:
        bonus -= 10
    score = max(0, min(100, base + bonus))
    level = 'very_high' if score >= 85 else 'high' if score >= 70 else 'medium' if score >= 50 else 'low' if score >= 30 else 'very_low'
    return CompatibilityResult(
        score=score,
        level=level, 
        analysis={
            'overall': '임시 분석 결과입니다. 실제 로직으로 대체하세요.',
            'strengths': [],
            'weaknesses': [],
            'advice': '',
        },
        details={
            'heavenlyStems': 60,
            'earthlyBranches': 65,
            'fiveElements': 70,
            'zodiacSign': 55,
        },
    )


@app.get('/health')
def health():
    r = get_resources()
    return {
        'status': 'ok',
        'earth_model': bool(r.get('earth_model')),
        'sky_model': bool(r.get('sky_model')),
        'calendar_loaded': bool(r.get('calendar')),
    }


@app.post('/fortune/calculate')
def calculate_fortune(payload: dict) -> FortuneInfo:
    birth = BirthInfo(**payload['birthInfo'])
    # TODO: replace with actual calculation using get_resources()
    return mock_calculate_fortune(birth)


@app.post('/fortune/compatibility')
def compatibility(payload: dict) -> CompatibilityResult:
    u1 = UserPayload(**payload['user1'])
    u2 = UserPayload(**payload['user2'])

    f1 = mock_calculate_fortune(u1.birthInfo)
    f2 = mock_calculate_fortune(u2.birthInfo)
    # TODO: replace with actual compatibility logic using models/data
    return mock_compatibility(f1, f2)


@app.post("/saju/recommend")
async def recommend_saju_topics(analysis_result: dict = Body(...)):
    """사주 기반 대화 주제 추천"""
    try:
        topics = recommend_topics(analysis_result)
        return {"status": "success", "topics": topics}
    except Exception as e:
        return {"status": "error", "message": str(e), "topics": []}