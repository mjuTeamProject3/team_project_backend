import { responseFromUser } from "../dtos/user.dto.js";
import { getUser, getUserWithCounts } from "../repositories/user.repository.js";

export const userProfile = async (userId) => {
  const user = await getUserWithCounts({ targetUserId: userId });
  if (!user) {
    throw new InvalidRequestError("유저를 찾을 수 없습니다.");
  }
  return responseFromUser({
    user,
  });
};

export const otherUserProfile = async ({ targetUserId }) => {
  const user = await getUserWithCounts({ targetUserId });
  if (!user) {
    throw new InvalidRequestError("유저를 찾을 수 없습니다.");
  }
  return responseFromUser({ user });
};
