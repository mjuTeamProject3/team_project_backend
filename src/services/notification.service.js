import { createNotification, getUserNotifications, markNotificationRead, processFriendRequestNotification } from '../repositories/notification.repository.js';

export const notifyUser = async (io, userId, type, content, refId) => {
  const note = await createNotification({ userId, type, content, refId });
  if (io) io.to(`user_${userId}`).emit('notification:new', note);
  return note;
};

export const listNotifications = async (userId, options = {}) =>
  getUserNotifications(userId, options);

export const readNotification = async (id) => markNotificationRead(id);

export const processFriendRequestNote = async (id) => processFriendRequestNotification(id);
