import express from "express";
import {
  handleCalculateFortune,
  handleCompatibility,
  handleRecommendTopics,
} from "../controllers/fortune.controller.js";

const route = express.Router();

route.post("/calculate", handleCalculateFortune);
route.post("/compatibility", handleCompatibility);
route.post("/recommend-topics", handleRecommendTopics);

export default route;

