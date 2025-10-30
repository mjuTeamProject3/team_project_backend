import { StatusCodes } from "http-status-codes";
import { acceptFriend, declineFriend, requestFriend } from "../services/friend.service.js";

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


