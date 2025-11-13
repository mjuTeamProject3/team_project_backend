import { prisma } from '../configs/db.config.js';

export const createNotification = async (data) => prisma.notification.create({ data });
export const getUserNotifications = async (userId, options = {}) =>
  prisma.notification.findMany({
    where: { userId, ...(options.type && { type: options.type }), ...(options.processed !== undefined && { processed: options.processed }), ...(options.isRead !== undefined && { isRead: options.isRead }) },
    orderBy: { createdAt: 'desc' },
    take: options.take || 30,
  });
export const markNotificationRead = async (id) =>
  prisma.notification.update({ where: { id }, data: { isRead: true } });
export const processFriendRequestNotification = async (id) =>
  prisma.notification.update({ where: { id }, data: { processed: true } });
