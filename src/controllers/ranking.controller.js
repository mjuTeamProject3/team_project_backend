import * as rankingService from '../services/ranking.service.js';

export const overall = async (req, res, next) => {
  try {
    const list = await rankingService.getTopOverall(5);
    res.json(list);
  } catch (e) { next(e); }
};

export const monthly = async (req, res, next) => {
  try {
    const list = await rankingService.getTopMonthly(5);
    res.json(list);
  } catch (e) { next(e); }
};

export const local = async (req, res, next) => {
  try {
    // verifyAccessToken 미들웨어에서 req.user.userId로 설정됨
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        resultType: "FAIL",
        error: {
          errorCode: "unauthorized",
          reason: "로그인이 필요합니다.",
          data: null,
        },
        success: null,
      });
    }
    const list = await rankingService.getTopLocal({ userId, limit: 5 });
    res.json(list);
  } catch (e) { next(e); }
};
