import express from 'express';
import * as ctrl from '../controllers/ranking.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const route = express.Router();

route.get('/overall', ctrl.overall);
route.get('/monthly', ctrl.monthly);
route.get('/local', verifyAccessToken, ctrl.local);

export default route;
