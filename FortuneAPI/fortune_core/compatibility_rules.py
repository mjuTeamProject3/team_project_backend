from __future__ import annotations

from pathlib import Path
from typing import List, Tuple

from .constants import MAX_SCORE, MIN_SCORE, TRAIT_LABELS

# Penalty weights (kept for compatibility with the original notebook logic)
p1 = 8
p11 = 9.5
p2 = 7
p21 = 8.2
p3 = 6
p31 = 7.2
p41 = 10
p42 = 8
p43 = 6
p5 = 8
p6 = 8
p7 = 0
p71 = 10
p8 = 0
p81 = 10
p82 = 6
p83 = 4


def _load_original_calculate():
    """
    Extracts the original `calculate` function from FortuneSRC/hd2.ipynb
    and compiles it so we can reuse the exact logic.
    """
    import json
    
    hd_path = Path(__file__).resolve().parents[2] / "FortuneSRC" / "hd2.ipynb"
    print(f"[compatibility_rules] Looking for notebook at: {hd_path}")
    print(f"[compatibility_rules] File exists: {hd_path.exists()}")
    
    if not hd_path.exists():
        print(f"[compatibility_rules] Notebook file not found!")
        return None
    
    try:
        nb_data = json.loads(hd_path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"[compatibility_rules] Failed to parse notebook JSON: {e}")
        return None

    # Find the cell containing the calculate function
    full_source = None
    for cell in nb_data.get("cells", []):
        if cell.get("cell_type") == "code":
            cell_source = "".join(cell.get("source", []))
            if "def calculate(" in cell_source and "return score, sal0, sal1" in cell_source:
                full_source = cell_source
                break
    
    if not full_source:
        print(f"[compatibility_rules] calculate function not found in notebook")
        return None
    
    # Extract just the calculate function
    start = full_source.find("def calculate(")
    end = full_source.find("return score, sal0, sal1", start)
    if start == -1 or end == -1:
        print(f"[compatibility_rules] Could not extract calculate function (start={start}, end={end})")
        return None
    
    source = full_source[start : end + len("return score, sal0, sal1\n")]
    namespace: dict[str, object] = {"p1": p1, "p11": p11, "p2": p2, "p21": p21, "p3": p3, "p31": p31, 
                                    "p41": p41, "p42": p42, "p43": p43, "p5": p5, "p6": p6, 
                                    "p7": p7, "p71": p71, "p8": p8, "p81": p81, "p82": p82, "p83": p83}
    try:
        exec(source, globals(), namespace)
        print(f"[compatibility_rules] Successfully loaded original calculate function")
    except Exception as e:
        print(f"[compatibility_rules] Failed to compile calculate function: {e}")
        import traceback
        traceback.print_exc()
        return None

    return namespace.get("calculate")


_ORIGINAL_CALCULATE = _load_original_calculate()


def calculate_pairs(
    token0: Tuple[int, int, int, int, int, int],
    token1: Tuple[int, int, int, int, int, int],
    gender0: int,
    gender1: int,
    score: float,
) -> Tuple[float, List[int], List[int]]:
    """
    Delegates to the original hd2.ipynb implementation when available.
    Falls back to a no-op result (no penalties) otherwise.
    """

    if _ORIGINAL_CALCULATE is not None:
        class _Scalar:
            def __init__(self, value: float) -> None:
                self._value = value

            def item(self) -> float:
                return float(self._value)

        try:
            new_score, sal0, sal1 = _ORIGINAL_CALCULATE(
                token0,
                token1,
                gender0,
                gender1,
                _Scalar(float(score)),
            )
            print(f"[compatibility_rules] Original calculate: score={score:.2f} -> {new_score:.2f}, sal0={list(sal0)}, sal1={list(sal1)}")
            return float(new_score), list(sal0), list(sal1)
        except Exception as e:
            print(f"[compatibility_rules] Error calling original calculate: {e}")
            import traceback
            traceback.print_exc()

    # Fallback: no penalties applied
    print(f"[compatibility_rules] Using fallback (no penalties) - _ORIGINAL_CALCULATE is None")
    base_score = float(score if not hasattr(score, "item") else score.item())
    return base_score, [0] * 8, [0] * 8


def apply_pair_penalties(
    token0: Tuple[int, int, int, int, int, int],
    token1: Tuple[int, int, int, int, int, int],
    gender0: int,
    gender1: int,
    score: float,
) -> Tuple[float, List[int], List[int]]:
    score_value, sal0, sal1 = calculate_pairs(token0, token1, gender0, gender1, score)
    score_value = max(MIN_SCORE, min(MAX_SCORE, score_value))
    return score_value, sal0, sal1


def traits_from_sal(sal: List[int]) -> List[str]:
    traits = []
    for idx, value in enumerate(sal):
        if value > 0 and idx < len(TRAIT_LABELS):
            traits.append(TRAIT_LABELS[idx])
    return traits or ["무난"]

