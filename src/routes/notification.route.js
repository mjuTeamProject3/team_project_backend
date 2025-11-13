import express from 'express';
import * as ctrl from '../controllers/notification.controller.js';
const route = express.Router();

route.get('/', ctrl.getNotifications);
route.patch('/:notifId/read', ctrl.readNotification);
route.patch('/:notifId/friend-request/process', ctrl.processFriendRequestNotification);

export default route;
