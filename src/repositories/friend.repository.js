import { prisma } from "../configs/db.config.js";

export const requestFriendship = async ({ requesterId, addresseeId }) => {
  if (requesterId === addresseeId) return null;
  // Normalize order to keep uniqueness predictable
  const [userOneId, userTwoId] = requesterId < addresseeId
    ? [requesterId, addresseeId]
    : [addresseeId, requesterId];
  try {
    const friendship = await prisma.friendship.upsert({
      where: { userOneId_userTwoId: { userOneId, userTwoId } },
      update: {},
      create: { userOneId, userTwoId, status: "PENDING" },
    });
    return friendship.id;
  } catch (e) {
    return null;
  }
};

export const updateFriendshipStatus = async ({ userAId, userBId, status }) => {
  const [userOneId, userTwoId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
  const updated = await prisma.friendship.update({
    where: { userOneId_userTwoId: { userOneId, userTwoId } },
    data: { status },
  });
  return updated.id;
};

export const countFriendsForUser = async ({ userId }) => {
  const count = await prisma.friendship.count({
    where: {
      status: "ACCEPTED",
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
  });
  return count;
};

/**
 * 친구 목록 조회
 * @param {Object} params - { userId, limit, offset }
 * @returns {Promise<Array>} 친구 목록 배열
 */
export const getFriendsList = async ({ userId, limit = 10, offset = 0 }) => {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { userOneId: userId },
        { userTwoId: userId }
      ]
    },
    include: {
      userOne: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          location: true
        }
      },
      userTwo: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          location: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset
  });

  // 각 친구 관계에서 상대방 정보만 추출
  const friends = friendships.map(friendship => {
    // 내가 userOne이면 상대방은 userTwo
    // 내가 userTwo이면 상대방은 userOne
    const friend = friendship.userOneId === userId 
      ? friendship.userTwo 
      : friendship.userOne;
    
    return friend;
  });

  return friends;
};

