import express from "express";
import {
  handleCalculateFortune,
  handleCompatibility,
} from "../controllers/fortune.controller.js";

const route = express.Router();

route.post("/calculate", handleCalculateFortune);
route.post("/compatibility", handleCompatibility);

export default route;

