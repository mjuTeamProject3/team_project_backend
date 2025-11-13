import { requestFriendship, updateFriendshipStatus } from "../repositories/friend.repository.js";
import { InvalidRequestError } from "../errors/auth.error.js";

export const requestFriend = async ({ requesterId, addresseeId }) => {
  const id = await requestFriendship({ requesterId, addresseeId });
  if (!id) throw new InvalidRequestError("요청을 처리할 수 없습니다.");
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


