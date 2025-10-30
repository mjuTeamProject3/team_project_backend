import { prisma } from '../configs/db.config.js';

const attachUsers = async (rows) => {
  const ids = rows.map((r) => r.toUserId);
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true, name: true, avatar: true, location: true } });
  const map = new Map(users.map((u) => [u.id, u]));
  return rows.map((r) => ({ likesCount: r._count.toUserId, user: map.get(r.toUserId) })).filter((x) => x.user);
};

export const getTopOverall = async (limit = 5) => {
  const rows = await prisma.like.groupBy({ by: ['toUserId'], _count: { toUserId: true }, orderBy: { _count: { toUserId: 'desc' } }, take: limit });
  return attachUsers(rows);
};

export const getTopMonthly = async (limit = 5, baseDate = new Date()) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const next = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
  const rows = await prisma.like.groupBy({
    by: ['toUserId'],
    where: { createdAt: { gte: start, lt: next } },
    _count: { toUserId: true },
    orderBy: { _count: { toUserId: 'desc' } },
    take: limit,
  });
  return attachUsers(rows);
};

export const getTopLocal = async ({ userId, limit = 5 }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { location: true } });
  const location = me?.location || null;
  if (!location) return [];
  const localUsers = await prisma.user.findMany({ where: { location }, select: { id: true } });
  const ids = localUsers.map((u) => u.id);
  if (ids.length === 0) return [];
  const rows = await prisma.like.groupBy({ by: ['toUserId'], where: { toUserId: { in: ids } }, _count: { toUserId: true }, orderBy: { _count: { toUserId: 'desc' } }, take: limit });
  return attachUsers(rows);
};
