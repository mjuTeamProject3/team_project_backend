import express from "express";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import testRoute from "./test.route.js";
import friendRoute from "./friend.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/test", testRoute);
router.use("/friend", friendRoute);

export default router;
