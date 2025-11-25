import { StatusCodes } from "http-status-codes";
import { acceptFriend, declineFriend, requestFriend, getMyFriends } from "../services/friend.service.js";

export const handleFriendRequest = async (req, res, next) => {
  try {
    await requestFriend({ requesterId: req.user.userId, addresseeId: Number(req.params.id) });
    res.status(StatusCodes.OK).success({});
  } catch (err) {
    return next(err);
  }
};

export const handleFriendAccept = async (req, res, next) => {
  try {
    await acceptFriend({ userAId: req.user.userId, userBId: Number(req.params.id) });
    res.status(StatusCodes.OK).success({});
  } catch (err) {
    return next(err);
  }
};

export const handleFriendDecline = async (req, res, next) => {
  try {
    await declineFriend({ userAId: req.user.userId, userBId: Number(req.params.id) });
    res.status(StatusCodes.OK).success({});
  } catch (err) {
    return next(err);
  }
};

/**
 * 친구 목록 조회
 */
export const handleGetFriends = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await getMyFriends({ userId, limit, offset });
    res.status(StatusCodes.OK).success(result);
  } catch (err) {
    return next(err);
  }
};

