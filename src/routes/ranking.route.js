import express from 'express';
import * as ctrl from '../controllers/ranking.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const route = express.Router();

route.get('/overall', ctrl.overall);
route.get('/monthly', ctrl.monthly);
route.get('/local', verifyAccessToken, ctrl.local); // 지역별 랭킹은 로그인 필요

export default route;
