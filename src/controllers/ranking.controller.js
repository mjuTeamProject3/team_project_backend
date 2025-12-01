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
    const userId = req.user?.userId;
    const list = await rankingService.getTopLocal({ userId, limit: 5 });
    res.json(list);
  } catch (e) { next(e); }
};
