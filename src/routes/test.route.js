import express from "express";
import { genaiClient, genaiModels } from "../utils/genai.util.js";
import { openaiClient, openaiModels } from "../utils/openai.util.js";
import { createJwt } from "../utils/jwt.util.js";
const route = express.Router();

route.get("/gemini", async (req, res, next) => {
  try {
    const response = await genaiClient(
      genaiModels.GEMINI_2_5_FLASH,
      req.body.text
    );
    res.json(response);
  } catch (error) {
    next(error);
  }
});

route.get("/openai", async (req, res, next) => {
  try {
    const response = await openaiClient(openaiModels.GPT_5_NANO, req.body.text);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default route;

// Dev-only helper: generate JWT with server secret
route.get("/jwt", (req, res) => {
  const userId = Number(req.query.userId || req.query.id || 1);
  const token = createJwt({ userId, type: "AT" });
  res.json({ token, userId });
});
