import { addLike, removeLike } from "../repositories/like.repository.js";
import { InvalidRequestError } from "../errors/auth.error.js";
import { notifyUser } from "./notification.service.js";

export const likeUser = async ({ fromUserId, toUserId, io }) => {
  const id = await addLike({ fromUserId, toUserId });
  if (!id) {
    throw new InvalidRequestError("이미 좋아요를 눌렀거나 자기 자신입니다.");
  }
  
  // 알림 생성 (실시간 전송은 하지 않음, 알림 화면에서 조회)
  try {
    await notifyUser(
      io,
      toUserId, // 알림을 받을 사용자 (좋아요를 받은 사람)
      'like',
      JSON.stringify({ username: null, name: null, avatar: null }), // fromUser 정보는 repository에서 조회
      id // Like ID
    );
    console.log('[like] 좋아요 알림 생성 완료:', { fromUserId, toUserId, likeId: id });
  } catch (err) {
    console.error('[like] 좋아요 알림 생성 실패:', err.message);
    // 알림 생성 실패는 좋아요를 막지 않음
  }
  
  return {};
};

export const unlikeUser = async ({ fromUserId, toUserId }) => {
  const ok = await removeLike({ fromUserId, toUserId });
  if (!ok) {
    throw new InvalidRequestError("좋아요가 존재하지 않습니다.");
  }
  return {};
};


