import express from "express";
import { handleUserProfile, handleUserProfileById, handleLikeUser, handleUnlikeUser, handleUpdateProfile } from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const route = express.Router();

route.get("/", verifyAccessToken, handleUserProfile);
route.get("/:id", verifyAccessToken, handleUserProfileById);
route.put("/profile", verifyAccessToken, handleUpdateProfile);
route.post("/:id/like", verifyAccessToken, handleLikeUser);
route.delete("/:id/like", verifyAccessToken, handleUnlikeUser);

export default route;
