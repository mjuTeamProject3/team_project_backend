import express from "express";
import { handleUserProfile, handleUserProfileById, handleLikeUser, handleUnlikeUser } from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const route = express.Router();

route.get("/", verifyAccessToken, handleUserProfile);
route.get("/:id", verifyAccessToken, handleUserProfileById);
route.post("/:id/like", verifyAccessToken, handleLikeUser);
route.delete("/:id/like", verifyAccessToken, handleUnlikeUser);

export default route;
