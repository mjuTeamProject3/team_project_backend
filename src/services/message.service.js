import { prisma } from '../configs/db.config.js';
import { createNotification } from '../repositories/notification.repository.js';

const areFriends = async (userAId, userBId) => {
  const f = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userOneId: userAId, userTwoId: userBId },
        { userOneId: userBId, userTwoId: userAId }
      ],
      status: 'ACCEPTED'
    }
  });
  return !!f;
};

export const sendMessage = async ({ fromUserId, toUserId, text, imageUrl }) => {
  if (!(await areFriends(fromUserId, toUserId)))
    throw new Error('친구끼리만 채팅이 가능합니다');
  if (!text && !imageUrl) throw new Error('메시지 내용이 없습니다');
  const message = await prisma.message.create({ data: { fromUserId, toUserId, text: text || '', imageUrl } });
  // 알림: 상대에게 메시지 도착
  await createNotification({
    userId: toUserId,
    type: 'message',
    content: imageUrl ? '[이미지]' : `${message.text}`,
    refId: message.id,
  });
  return message;
};

export const getChatHistory = async ({ userId, partnerUserId, limit = 50 }) =>
  prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: userId, toUserId: partnerUserId },
        { fromUserId: partnerUserId, toUserId: userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
