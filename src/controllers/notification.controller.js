import * as notificationService from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.auth?.userId;
    const notes = await notificationService.listNotifications(userId, req.query);
    res.json(notes);
  } catch (e) { next(e); }
};

export const readNotification = async (req, res, next) => {
  try {
    await notificationService.readNotification(+req.params.notifId);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

export const processFriendRequestNotification = async (req, res, next) => {
  try {
    await notificationService.processFriendRequestNote(+req.params.notifId);
    res.json({ ok: true });
  } catch (e) { next(e); }
};
