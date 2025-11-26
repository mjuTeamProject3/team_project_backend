STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]

STEM_TO_INDEX = {name: idx + 1 for idx, name in enumerate(STEMS)}
BRANCH_TO_INDEX = {name: idx + 1 for idx, name in enumerate(BRANCHES)}

ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"]
BRANCH_TO_ANIMAL = {name: ANIMALS[idx] for idx, name in enumerate(BRANCHES)}

ELEMENT_BY_STEM = {
    "갑": "목",
    "을": "목",
    "병": "화",
    "정": "화",
    "무": "토",
    "기": "토",
    "경": "금",
    "신": "금",
    "임": "수",
    "계": "수",
}

# Trait labels used by the original research notebook
TRAIT_LABELS = [
    "열정 · 에너지 · 예술 · 중독",
    "예민 · 직감 · 영적 · 불안",
    "감정기복 · 갈등 · 오해 · 고독",
    "강함 · 용감 · 충동 · 변화",
    "책임감 · 의리 · 완벽 · 자존심 · 인내",
    "충돌 · 자유 · 고집",
    "카리스마 · 승부욕 · 용감 · 외로움",
    "의지 · 솔직 · 직설 · 개성 · 독립심",
]

DEFAULT_BASE_SCORE = 60.0
MIN_SCORE = 0.0
MAX_SCORE = 100.0

