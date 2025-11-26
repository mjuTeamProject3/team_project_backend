from __future__ import annotations

import threading
from pathlib import Path
from typing import Tuple

import numpy as np


class CalendarTable:
    """Lazy loader for the historical calendar table."""

    _instance = None
    _lock = threading.Lock()

    def __init__(self, csv_path: Path) -> None:
        self.csv_path = csv_path
        self._data = np.loadtxt(
            csv_path,
            delimiter=",",
            skiprows=1,
            dtype=np.int64,
            encoding="euc-kr",
        )

    @classmethod
    def get(cls, csv_path: Path) -> "CalendarTable":
        with cls._lock:
            if cls._instance is None or cls._instance.csv_path != csv_path:
                cls._instance = cls(csv_path)
        return cls._instance

    def row_for_year(self, year: int) -> np.ndarray:
        idx = year - 1904
        if idx < 0 or idx >= len(self._data):
            raise ValueError("cal.csv supports years from 1904 onwards.")
        return self._data[idx]


def get_calendar_tokens(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    csv_path: Path,
) -> Tuple[int, int, int, int]:
    """
    Port of hd2.ipynb:getCalendar.
    Returns (year_stem, year_branch, month_stem, month_branch).
    """
    row = CalendarTable.get(csv_path).row_for_year(year)

    (
        b_y,
        c_y,
        d_y,
        e_y,
        f_y,
        g_y,
        h_y,
        i_y,
        j_y,
        k_y,
        l_y,
        m_y,
        n_y,
        o_y,
        p_y,
        q_y,
        r_y,
        s_y,
        t_y,
        u_y,
        v_y,
        w_y,
        x_y,
        y_y,
    ) = row[1:]

    n1 = year * 100 + month
    n2 = day * 10_000 + hour * 100 + minute

    # Year heavenly stem
    ry = (year - 1904) % 10
    ys = ry + 1
    if n1 < d_y:
        ys -= 1
    if n1 == d_y and n2 < e_y:
        ys -= 1
    if ys == 0:
        ys = 10

    # Year earthly branch
    ry2 = (year - 1990) % 12
    yg = ry2 + 3
    if yg <= 0:
        yg += 12
    if yg > 12:
        yg -= 12
    if n1 < d_y:
        yg -= 1
    if n1 == d_y and n2 < e_y:
        yg -= 1
    if yg <= 0:
        yg += 12

    # Month earthly branch
    if n1 == b_y:
        mg = 11 if n2 < c_y else 12
    elif n1 == d_y:
        mg = 12 if n2 < e_y else 1
    elif n1 == f_y:
        mg = 1 if n2 < g_y else 2
    elif n1 == h_y:
        mg = 2 if n2 < i_y else 3
    elif n1 == j_y:
        mg = 3 if n2 < k_y else 4
    elif n1 == l_y:
        mg = 4 if n2 < m_y else 5
    elif n1 == n_y:
        mg = 5 if n2 < o_y else 6
    elif n1 == p_y:
        mg = 6 if n2 < q_y else 7
    elif n1 == r_y:
        mg = 7 if n2 < s_y else 8
    elif n1 == t_y:
        mg = 8 if n2 < u_y else 9
    elif n1 == v_y:
        mg = 9 if n2 < w_y else 10
    elif n1 == x_y:
        mg = 10 if n2 < y_y else 11
    else:
        mg = 12

    # Month heavenly stem
    if ys in (1, 6):
        ms = 3 + (mg - 1)
    elif ys in (2, 7):
        ms = 5 + (mg - 1)
    elif ys in (3, 8):
        ms = 7 + (mg - 1)
    elif ys in (4, 9):
        ms = 9 + (mg - 1)
    else:
        ms = 1 + (mg - 1)
    if ms > 10:
        ms -= 10

    yg += 2
    if yg > 12:
        yg -= 12
    mg += 2
    if mg > 12:
        mg -= 12

    return ys, yg, ms, mg

