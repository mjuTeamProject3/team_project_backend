import express from 'express';
import * as ctrl from '../controllers/notification.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const route = express.Router();

route.get('/', verifyAccessToken, ctrl.getNotifications);
route.patch('/:notifId/read', verifyAccessToken, ctrl.readNotification);
route.patch('/:notifId/friend-request/process', verifyAccessToken, ctrl.processFriendRequestNotification);

export default route;
