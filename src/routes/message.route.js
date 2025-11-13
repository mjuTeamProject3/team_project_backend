import express from 'express';
import * as msgService from '../services/message.service.js';
const route = express.Router();

route.post('/', async (req, res, next) => {
  try {
    const fromUserId = req.user?.id || req.auth?.userId;
    const { toUserId, text } = req.body;
    const msg = await msgService.sendMessage({ fromUserId, toUserId, text });
    res.json(msg);
  } catch (e) { next(e); }
});

route.get('/:partnerId', async (req, res, next) => {
  try {
    const userId = req.user?.id || req.auth?.userId;
    const partnerUserId = +req.params.partnerId;
    const msgs = await msgService.getChatHistory({ userId, partnerUserId });
    res.json(msgs);
  } catch (e) { next(e); }
});

export default route;
