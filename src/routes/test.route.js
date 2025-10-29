import express from "express";
import { genaiClient, genaiModels } from "../utils/genai.util.js";
import { openaiClient, openaiModels } from "../utils/openai.util.js";
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
