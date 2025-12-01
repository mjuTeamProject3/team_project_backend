import { StatusCodes } from "http-status-codes";
import { acceptFriend, declineFriend, requestFriend, getMyFriends } from "../services/friend.service.js";

export const handleGetFriends = async (req, res, next) => {
  try {
    const result = await getMyFriends({ userId: req.user.userId });
    res.status(StatusCodes.OK).success(result);
  } catch (err) {
    return next(err);
  }
};

export const handleFriendRequest = async (req, res, next) => {
  try {
    // Socket.io 인스턴스 가져오기
    const io = req.app.get('io');
    await requestFriend({ 
      requesterId: req.user.userId, 
      addresseeId: Number(req.params.id),
      io 
    });
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


