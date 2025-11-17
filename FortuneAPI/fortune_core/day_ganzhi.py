from __future__ import annotations

import datetime as dt
import os
from typing import Tuple
from xml.etree import ElementTree

from importlib import import_module
from dotenv import load_dotenv

# .env 파일 로드 (프로젝트 루트 우선)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
root_env_path = os.path.join(project_root, '.env')
print(f"[DayGanJi] Project root: {project_root}")
print(f"[DayGanJi] Looking for .env at: {root_env_path}")
print(f"[DayGanJi] .env exists: {os.path.exists(root_env_path)}")
if os.path.exists(root_env_path):
    load_dotenv(dotenv_path=root_env_path, override=False)
    print(f"[DayGanJi] Loaded .env from: {root_env_path}")
    # 확인: 키가 로드되었는지
    test_key = os.getenv("KOREA_LUNAR_API_KEY")
    print(f"[DayGanJi] KOREA_LUNAR_API_KEY after load: {'SET' if test_key else 'NOT SET'}")

try:
    requests = import_module("requests")
    print(f"[DayGanJi] requests module imported successfully: {requests}")
except ModuleNotFoundError as e:  # pragma: no cover
    requests = None
    print(f"[DayGanJi] requests import failed: {e}")
except Exception as e:
    requests = None
    print(f"[DayGanJi] requests import error: {type(e).__name__}: {e}")

from .constants import BRANCHES, STEMS

API_ENDPOINT = (
    "https://apis.data.go.kr/B090041/openapi/service/"
    "LrsrCldInfoService/getLunCalInfo"
)


class DayGanJiResolver:
    """
    Resolve day-level heavenly stem / earthly branch info.

    Tries the official Korean lunar calendar OpenAPI if an API key is provided.
    Falls back to a deterministic astronomical approximation when offline.
    """

    def __init__(self) -> None:
        self.api_key = os.getenv("KOREA_LUNAR_API_KEY")
        print(f"[DayGanJi.__init__] api_key from os.getenv: {'SET' if self.api_key else 'NOT SET'}")
        print(f"[DayGanJi.__init__] requests available: {requests is not None}")
        if requests and self.api_key:
            self.session = requests.Session()
            print(f"[DayGanJi.__init__] Created requests session")
        else:
            self.session = None
            if not requests:
                print(f"[DayGanJi.__init__] No requests module, session=None")
            if not self.api_key:
                print(f"[DayGanJi.__init__] No API key, session=None")

    def resolve(
        self,
        year: int,
        month: int,
        day: int,
    ) -> Tuple[str, str]:
        if self.session and self.api_key:
            try:
                result = self._resolve_via_api(year, month, day)
                print(f"[DayGanJi] API success: {year}-{month:02d}-{day:02d} -> {result[0]}{result[1]}")
                return result
            except Exception as e:
                # fallback to approximation
                import traceback
                print(f"[DayGanJi] API failed for {year}-{month:02d}-{day:02d}: {type(e).__name__}: {e}")
                print(f"[DayGanJi] Traceback: {traceback.format_exc()}")
        else:
            if not self.session:
                print(f"[DayGanJi] No requests session (requests library not available)")
            if not self.api_key:
                print(f"[DayGanJi] KOREA_LUNAR_API_KEY not set in environment")
        result = self._resolve_via_approximation(year, month, day)
        print(f"[DayGanJi] Approximation: {year}-{month:02d}-{day:02d} -> {result[0]}{result[1]}")
        return result

    def _resolve_via_api(
        self,
        year: int,
        month: int,
        day: int,
    ) -> Tuple[str, str]:
        params = {
            "solYear": str(year),
            "solMonth": f"{month:02d}",
            "solDay": f"{day:02d}",
            "ServiceKey": self.api_key,
        }
        if not self.session:
            raise RuntimeError("requests library not available")
        resp = self.session.get(API_ENDPOINT, params=params, timeout=5)
        resp.raise_for_status()
        root = ElementTree.fromstring(resp.text)
        # 동일 구조 유지: root[1][0][0][1] == 음력간지 문자열 (예: "갑자")
        ganji_text = root.findtext(".//lunDayGanJi")
        if not ganji_text:
            ganji_text = root[1][0][0][1].text  # type: ignore[index]
        if not ganji_text or len(ganji_text) < 2:
            raise ValueError("Invalid response from lunar API")
        return ganji_text[0], ganji_text[1]

    def _resolve_via_approximation(
        self,
        year: int,
        month: int,
        day: int,
    ) -> Tuple[str, str]:
        """Approximate day pillar using the sexagenary cycle."""
        date = dt.date(year, month, day)
        base = dt.date(1984, 2, 2)  # widely referenced 갑자 day
        delta = (date - base).days
        idx = delta % 60
        stem = STEMS[idx % 10]
        branch = BRANCHES[idx % 12]
        return stem, branch

