import { StatusCodes } from "http-status-codes";
import * as notificationService from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId; // verifyAccessToken 미들웨어로 보장됨
    console.log('[notification] 알림 조회 요청:', { 
      userId, 
      query: req.query,
      processedType: typeof req.query.processed,
      processedValue: req.query.processed
    });
    const notes = await notificationService.listNotifications(userId, req.query);
    console.log('[notification] 알림 조회 결과:', notes.length, '개');
    if (notes.length > 0) {
      console.log('[notification] 첫 번째 알림:', { 
        id: notes[0].id, 
        type: notes[0].type, 
        processed: notes[0].processed,
        userId: notes[0].userId
      });
    }
    res.status(StatusCodes.OK).success(notes);
  } catch (e) { 
    console.error('[notification] 알림 조회 에러:', e);
    next(e); 
  }
};

export const readNotification = async (req, res, next) => {
  try {
    await notificationService.readNotification(+req.params.notifId);
    res.status(StatusCodes.OK).success({ ok: true });
  } catch (e) { next(e); }
};

export const processFriendRequestNotification = async (req, res, next) => {
  try {
    await notificationService.processFriendRequestNote(+req.params.notifId);
    res.status(StatusCodes.OK).success({ ok: true });
  } catch (e) { next(e); }
};
