from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Tuple

from .compatibility_rules import apply_pair_penalties, traits_from_sal
from .constants import (
    BRANCHES,
    BRANCH_TO_ANIMAL,
    ELEMENT_BY_STEM,
    MAX_SCORE,
    MIN_SCORE,
    STEMS,
)
from .data_loader import get_calendar_tokens
from .day_ganzhi import DayGanJiResolver
from .models import ModelBundle


def _stem_name(idx: int) -> str:
    return STEMS[(idx - 1) % len(STEMS)]


def _branch_name(idx: int) -> str:
    return BRANCHES[(idx - 1) % len(BRANCHES)]


def _gender_flag(gender: str) -> int:
    return 1 if gender.lower().startswith("m") or gender in ("남", "남성") else 0


@dataclass(frozen=True)
class BirthRecord:
    year: int
    month: int
    day: int
    is_lunar: bool
    gender: str


class FortuneEngine:
    def __init__(self, fortune_src_dir: Path) -> None:
        self.src_dir = fortune_src_dir
        self.calendar_csv = fortune_src_dir / "cal.csv"
        self.earth_model_path = fortune_src_dir / "earth3000.h5"
        self.sky_model_path = fortune_src_dir / "sky3000.h5"
        self.models = ModelBundle.get(self.earth_model_path, self.sky_model_path)
        self.day_resolver = DayGanJiResolver()

    def birth_to_tokens(self, birth: BirthRecord) -> Tuple[int, int, int, int, int, int]:
        ys, yg, ms, mg = get_calendar_tokens(
            birth.year,
            birth.month,
            birth.day,
            12,
            0,
            self.calendar_csv,
        )
        day_stem_char, day_branch_char = self.day_resolver.resolve(
            birth.year, birth.month, birth.day
        )
        day_stem = STEMS.index(day_stem_char) + 1
        day_branch = BRANCHES.index(day_branch_char) + 1
        return ys, yg, ms, mg, day_stem, day_branch

    def calculate_four_pillars(
        self,
        birth: BirthRecord,
    ) -> Dict[str, Dict[str, str]]:
        ys, yg, ms, mg, ds, dg = self.birth_to_tokens(birth)
        heavenly = {
            "year": _stem_name(ys),
            "month": _stem_name(ms),
            "day": _stem_name(ds),
        }
        earthly = {
            "year": _branch_name(yg),
            "month": _branch_name(mg),
            "day": _branch_name(dg),
        }
        five_elements = {
            "year": ELEMENT_BY_STEM[heavenly["year"]],
            "month": ELEMENT_BY_STEM[heavenly["month"]],
            "day": ELEMENT_BY_STEM[heavenly["day"]],
        }
        return {
            "heavenlyStems": heavenly,
            "earthlyBranches": earthly,
            "fiveElements": five_elements,
            "zodiacSign": earthly["year"],
            "animalSign": BRANCH_TO_ANIMAL[earthly["year"]],
        }

    def compute_compatibility(self, a: BirthRecord, b: BirthRecord) -> Dict:
        token_a = self.birth_to_tokens(a)
        token_b = self.birth_to_tokens(b)
        print(f"[FortuneEngine] token_a: {token_a} (year={a.year}, month={a.month}, day={a.day}, gender={a.gender})")
        print(f"[FortuneEngine] token_b: {token_b} (year={b.year}, month={b.month}, day={b.day}, gender={b.gender})")
        gender_a = _gender_flag(a.gender)
        gender_b = _gender_flag(b.gender)

        ys_score = self.models.predict_sky(token_a[0], token_b[0])
        ms_score = self.models.predict_sky(token_a[2], token_b[2])
        ds_score = self.models.predict_sky(token_a[4], token_b[4])
        ye_score = self.models.predict_earth(token_a[1], token_b[1])
        me_score = self.models.predict_earth(token_a[3], token_b[3])
        de_score = self.models.predict_earth(token_a[5], token_b[5])

        original = (
            0.6 * ys_score
            + 4.5 * ds_score
            + 1.0 * ye_score
            + 1.5 * me_score
            + 4.5 * de_score
        )
        original = max(MIN_SCORE, min(MAX_SCORE, original))
        print(f"[FortuneEngine] Original Score: {original:.10f} (ys={ys_score:.2f}, ds={ds_score:.2f}, ye={ye_score:.2f}, me={me_score:.2f}, de={de_score:.2f})")

        final, sal0, sal1 = apply_pair_penalties(
            token_a,
            token_b,
            gender_a,
            gender_b,
            original,
        )
        print(f"[FortuneEngine] Final Score: {final:.10f}, sal0={sal0}, sal1={sal1}")

        if sum(sal0) > 0 and sum(sal1) > 0:
            stress = 0.5 * (106 - original) + (original - final) * 1.8
        else:
            stress = 0.5 * (106 - original) + (original - final)

        stress = max(MIN_SCORE, min(150.0, stress))

        level = (
            "very_high"
            if final >= 85
            else "high"
            if final >= 70
            else "medium"
            if final >= 50
            else "low"
            if final >= 30
            else "very_low"
        )

        traits_a = traits_from_sal(sal0)
        traits_b = traits_from_sal(sal1)

        analysis = {
            "overall": self._build_overall_message(final, stress),
            "strengths": traits_a,
            "weaknesses": traits_b,
            "advice": "진짜 로직 연결 전 임시 메시지입니다.",
        }

        details = {
            "skyYear": round(ys_score, 2),
            "skyDay": round(ds_score, 2),
            "earthYear": round(ye_score, 2),
            "earthMonth": round(me_score, 2),
            "earthDay": round(de_score, 2),
        }

        return {
            "score": round(final, 2),
            "finalScore": round(final, 2),
            "originalScore": round(original, 2),
            "stressScore": round(stress, 2),
            "level": level,
            "analysis": analysis,
            "details": details,
            "traits": {
                "user1": traits_a,
                "user2": traits_b,
            },
        }

    @staticmethod
    def _build_overall_message(final: float, stress: float) -> str:
        if final >= 80 and stress <= 40:
            return "상호 보완이 잘 되는 궁합입니다."
        if final >= 60 and stress <= 60:
            return "안정적인 호환성입니다. 대화를 자주 나눠보세요."
        if final < 40:
            return "충돌 가능성이 높습니다. 서로 배려가 필요합니다."
        return "보통 수준의 궁합입니다. 공통 관심사를 찾아보세요."


_engine: FortuneEngine | None = None


def get_engine(src_dir: Path) -> FortuneEngine:
    global _engine
    if _engine is None or _engine.src_dir != src_dir:
        _engine = FortuneEngine(src_dir)
    return _engine


def calculate_four_pillars(src_dir: Path, birth: BirthRecord) -> Dict:
    engine = get_engine(src_dir)
    return engine.calculate_four_pillars(birth)


def compute_fortune_snapshot(src_dir: Path, birth: BirthRecord) -> Dict:
    return calculate_four_pillars(src_dir, birth)


def compute_compatibility_result(
    src_dir: Path,
    birth_a: BirthRecord,
    birth_b: BirthRecord,
) -> Dict:
    engine = get_engine(src_dir)
    return engine.compute_compatibility(birth_a, birth_b)

