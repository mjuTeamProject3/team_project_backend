import os
from pathlib import Path
from typing import Literal, Dict, Any

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from gemini_service import recommend_topics
from fortune_core.service import (
    BirthRecord,
    compute_compatibility_result,
    compute_fortune_snapshot,
    get_engine,
)


FORTUNE_SRC_DIR = Path(__file__).resolve().parent.parent / "FortuneSRC"
EARTH_MODEL_PATH = FORTUNE_SRC_DIR / "earth3000.h5"
SKY_MODEL_PATH = FORTUNE_SRC_DIR / "sky3000.h5"
CAL_CSV_PATH = FORTUNE_SRC_DIR / "cal.csv"


class BirthInfo(BaseModel):
    year: int
    month: int
    day: int
    isLunar: bool
    gender: Literal['male', 'female']


class FortuneInfo(BaseModel):
    heavenlyStems: Dict[str, str]
    earthlyBranches: Dict[str, str]
    fiveElements: Dict[str, str]
    zodiacSign: str
    animalSign: str


class UserPayload(BaseModel):
    birthInfo: BirthInfo


class CompatibilityResult(BaseModel):
    score: float
    finalScore: float
    originalScore: float
    stressScore: float
    level: Literal['very_high', 'high', 'medium', 'low', 'very_low']
    analysis: Dict[str, Any]
    details: Dict[str, float]
    traits: Dict[str, Any]


app = FastAPI(title='FateTry Fortune API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def _to_birth_record(info: BirthInfo) -> BirthRecord:
    return BirthRecord(
        year=info.year,
        month=info.month,
        day=info.day,
        is_lunar=info.isLunar,
        gender=info.gender,
    )


@app.get('/health')
def health():
    engine = get_engine(FORTUNE_SRC_DIR)
    return {
        'status': 'ok',
        'earth_model': engine.models.earth is not None,
        'sky_model': engine.models.sky is not None,
        'calendar_loaded': True,
    }


@app.post('/fortune/calculate')
def calculate_fortune(payload: dict) -> FortuneInfo:
    birth = BirthInfo(**payload['birthInfo'])
    snapshot = compute_fortune_snapshot(FORTUNE_SRC_DIR, _to_birth_record(birth))
    return FortuneInfo(**snapshot)


@app.post('/fortune/compatibility')
def compatibility(payload: dict) -> CompatibilityResult:
    u1 = UserPayload(**payload['user1'])
    u2 = UserPayload(**payload['user2'])
    result = compute_compatibility_result(
        FORTUNE_SRC_DIR,
        _to_birth_record(u1.birthInfo),
        _to_birth_record(u2.birthInfo),
    )
    return CompatibilityResult(**result)


@app.post("/saju/recommend")
async def recommend_saju_topics(analysis_result: dict = Body(...)):
    """사주 기반 대화 주제 추천"""
    try:
        topics = recommend_topics(analysis_result)
        return {"status": "success", "topics": topics}
    except Exception as e:
        return {"status": "error", "message": str(e), "topics": []}