from __future__ import annotations

import threading
from pathlib import Path
from typing import Optional

import numpy as np

tf = None
MeanSquaredError = None
try:
    import tensorflow as _tf  # type: ignore
    from tensorflow.keras.metrics import MeanSquaredError as _MeanSquaredError  # type: ignore

    tf = _tf
    MeanSquaredError = _MeanSquaredError
except Exception:
    tf = None
    MeanSquaredError = None


class ModelBundle:
    _instance = None
    _lock = threading.Lock()

    def __init__(self, earth_path: Path, sky_path: Path) -> None:
        self.earth = self._load(earth_path)
        self.sky = self._load(sky_path)

    @staticmethod
    def _load(path: Path):
        if tf is None or not path.exists():
            return None
        return tf.keras.models.load_model(
            path,
            custom_objects={"mse": MeanSquaredError} if MeanSquaredError else None,
        )

    @classmethod
    def get(cls, earth_path: Path, sky_path: Path) -> "ModelBundle":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls(earth_path, sky_path)
        return cls._instance

    def predict_sky(self, a: int, b: int) -> float:
        if not self.sky:
            return 50.0
        vec = _one_hot_pair(a, b, 10)
        return float(self.sky.predict(vec, verbose=0)[0][0])

    def predict_earth(self, a: int, b: int) -> float:
        if not self.earth:
            return 50.0
        vec = _one_hot_pair(a, b, 12)
        return float(self.earth.predict(vec, verbose=0)[0][0])


def _one_hot_pair(a: int, b: int, nb_classes: int) -> np.ndarray:
    arr = np.zeros((1, nb_classes * 2), dtype=np.float32)
    arr[0, a - 1] = 1.0
    arr[0, nb_classes + b - 1] = 1.0
    return arr

