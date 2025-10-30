import { prisma } from "../configs/db.config.js";

export const addLike = async ({ fromUserId, toUserId }) => {
  if (fromUserId === toUserId) {
    return null;
  }
  try {
    const like = await prisma.like.create({
      data: { fromUserId, toUserId },
    });
    return like.id;
  } catch (e) {
    // unique constraint -> already liked
    return null;
  }
};

export const removeLike = async ({ fromUserId, toUserId }) => {
  const deleted = await prisma.like.deleteMany({
    where: { fromUserId, toUserId },
  });
  return deleted.count > 0;
};

export const countLikesForUser = async ({ userId }) => {
  const count = await prisma.like.count({ where: { toUserId: userId } });
  return count;
};

export const hasUserLiked = async ({ fromUserId, toUserId }) => {
  const existing = await prisma.like.findFirst({ where: { fromUserId, toUserId } });
  return !!existing;
};


