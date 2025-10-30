import express from 'express';
import * as ctrl from '../controllers/ranking.controller.js';
const route = express.Router();

route.get('/overall', ctrl.overall);
route.get('/monthly', ctrl.monthly);
route.get('/local', ctrl.local);

export default route;
