import express from "express";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import testRoute from "./test.route.js";
import friendRoute from "./friend.route.js";
import notificationRoute from "./notification.route.js";
import messageRoute from "./message.route.js";
import rankingRoute from "./ranking.route.js";
import uploadRoute from "./upload.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/test", testRoute);
router.use("/friend", friendRoute);
router.use("/notification", notificationRoute);
router.use("/message", messageRoute);
router.use("/ranking", rankingRoute);
router.use("/upload", uploadRoute);

export default router;
