import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUiExpress from "swagger-ui-express";
import apiRoute from "./routes/index.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { stateHandler } from "./middlewares/state.middleware.js";
import { swaggerOptions } from "./configs/swagger.config.js";
import { corsOptions } from "./configs/cors.config.js";
import { swaggerHandler } from "./middlewares/swagger.middleware.js";
import "./configs/passport.config.js"; // Passport 설정 초기화

const app = express();
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(stateHandler);

app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(null, swaggerOptions)
);

app.get("/openapi.json", swaggerHandler);

app.use("/v1/api/", apiRoute);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
});
