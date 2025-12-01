import { prisma } from '../configs/db.config.js';

export const createNotification = async (data) => prisma.notification.create({ data });

export const getUserNotifications = async (userId, options = {}) => {
  // where 조건 구성
  const where = { userId };
  
  if (options.type) {
    where.type = options.type;
  }
  
  // processed 조건: 문자열 "false"를 boolean false로 변환하고, false인 경우 null도 포함
  if (options.processed !== undefined) {
    // 쿼리 파라미터는 문자열로 오므로 변환 필요
    const processedValue = String(options.processed).toLowerCase() === 'false' ? false : 
                          String(options.processed).toLowerCase() === 'true' ? true : 
                          options.processed;
    
    if (processedValue === false) {
      // false 또는 null 모두 포함 - AND 조건으로 명확하게 구성
      where.AND = [
        { userId },
        {
          OR: [
            { processed: false },
            { processed: null }
          ]
        }
      ];
      // AND에 userId를 포함했으므로 기본 userId 조건 제거
      delete where.userId;
    } else {
      where.processed = processedValue;
    }
  }
  
  // isRead 조건도 문자열 처리
  if (options.isRead !== undefined) {
    const isReadValue = String(options.isRead).toLowerCase() === 'false' ? false : 
                        String(options.isRead).toLowerCase() === 'true' ? true : 
                        options.isRead;
    where.isRead = isReadValue;
  }
  
  console.log('[notification] Prisma where 조건:', JSON.stringify(where, null, 2));
  
  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.take || 30,
  });
  
  console.log('[notification] 조회된 알림 개수:', notifications.length);
  
  // 각 알림에 발신자 정보 추가
  const notificationsWithUser = await Promise.all(
    notifications.map(async (notif) => {
      let fromUser = null;
      
      // refId가 있으면 해당 엔티티에서 사용자 정보 가져오기
      if (notif.refId && (notif.type === 'friend_request' || notif.type === 'like')) {
        try {
          if (notif.type === 'friend_request') {
            // Friendship에서 요청한 사용자 찾기
            const friendship = await prisma.friendship.findUnique({
              where: { id: notif.refId },
              include: {
                userOne: { select: { id: true, username: true, name: true, avatar: true } },
                userTwo: { select: { id: true, username: true, name: true, avatar: true } }
              }
            });
            if (friendship) {
              // userId가 아닌 상대방이 발신자
              fromUser = friendship.userOneId === userId ? friendship.userTwo : friendship.userOne;
            }
          } else if (notif.type === 'like') {
            // Like에서 좋아요를 누른 사용자 찾기
            const like = await prisma.like.findUnique({
              where: { id: notif.refId },
              include: {
                fromUser: { select: { id: true, username: true, name: true, avatar: true } }
              }
            });
            if (like) {
              fromUser = like.fromUser;
            }
          }
        } catch (err) {
          console.error('[notification] 사용자 정보 조회 실패:', err.message);
        }
      }
      
      // content에서 파싱한 정보와 병합
      let parsedContent = {};
      try {
        if (notif.content) {
          parsedContent = JSON.parse(notif.content);
        }
      } catch (e) {
        // JSON 파싱 실패 시 content를 그대로 사용
        parsedContent = { message: notif.content };
      }
      
      return {
        ...notif,
        fromUser: fromUser || {
          id: null,
          username: parsedContent.username || null,
          name: parsedContent.name || null,
          avatar: parsedContent.avatar || null,
        },
        content: parsedContent,
      };
    })
  );
  
  return notificationsWithUser;
};

export const markNotificationRead = async (id) =>
  prisma.notification.update({ where: { id }, data: { isRead: true } });

export const processFriendRequestNotification = async (id) =>
  prisma.notification.update({ where: { id }, data: { processed: true } });
