export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // 상태 코드 설정
  const statusCode = err.statusCode || 500;
  res.status(statusCode);

  // res.error 메서드가 정의되어 있는지 확인
  if (typeof res.error === 'function') {
    return res.error({
      errorCode: err.errorCode || "unknown",
      reason: err.reason || err.message || null,
      data: err.data || null,
    });
  }

  // res.error가 없는 경우 직접 JSON 응답
  return res.json({
    resultType: "FAIL",
    error: {
      errorCode: err.errorCode || "unknown",
      reason: err.reason || err.message || null,
      data: err.data || null,
    },
    success: null,
  });
};
