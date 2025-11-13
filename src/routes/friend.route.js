import express from "express";
import { handleFriendAccept, handleFriendDecline, handleFriendRequest } from "../controllers/friend.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/request/:id", verifyAccessToken, handleFriendRequest);
route.post("/accept/:id", verifyAccessToken, handleFriendAccept);
route.post("/decline/:id", verifyAccessToken, handleFriendDecline);

export default route;


