import { requestFriendship, updateFriendshipStatus, getFriendsList } from "../repositories/friend.repository.js";
import { InvalidRequestError } from "../errors/auth.error.js";
import { notifyUser } from "./notification.service.js";

export const getMyFriends = async ({ userId }) => {
  const friends = await getFriendsList({ userId });
  return { friends };
};

export const requestFriend = async ({ requesterId, addresseeId, io }) => {
  const id = await requestFriendship({ requesterId, addresseeId });
  if (!id) throw new InvalidRequestError("요청을 처리할 수 없습니다.");
  
  // 알림 생성 (실시간 전송은 하지 않음, 알림 화면에서 조회)
  try {
    await notifyUser(
      io,
      addresseeId, // 알림을 받을 사용자 (요청을 받은 사람)
      'friend_request',
      JSON.stringify({ username: null, name: null, avatar: null }), // fromUser 정보는 repository에서 조회
      id // Friendship ID
    );
    console.log('[friend] 친구 요청 알림 생성 완료:', { requesterId, addresseeId, friendshipId: id });
  } catch (err) {
    console.error('[friend] 친구 요청 알림 생성 실패:', err.message);
    // 알림 생성 실패는 친구 요청을 막지 않음
  }
  
  return {};
};

export const acceptFriend = async ({ userAId, userBId }) => {
  await updateFriendshipStatus({ userAId, userBId, status: "ACCEPTED" });
  return {};
};

export const declineFriend = async ({ userAId, userBId }) => {
  await updateFriendshipStatus({ userAId, userBId, status: "REJECTED" });
  return {};
};


