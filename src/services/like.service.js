import { addLike, removeLike } from "../repositories/like.repository.js";
import { InvalidRequestError } from "../errors/auth.error.js";

export const likeUser = async ({ fromUserId, toUserId }) => {
  const id = await addLike({ fromUserId, toUserId });
  if (!id) {
    throw new InvalidRequestError("이미 좋아요를 눌렀거나 자기 자신입니다.");
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


