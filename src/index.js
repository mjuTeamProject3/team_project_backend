import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import swaggerUiExpress from "swagger-ui-express";
import session from "express-session";
import cookieParser from "cookie-parser";
import apiRoute from "./routes/index.route.js";
import { initSocket } from "./realtime/socket.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { stateHandler } from "./middlewares/state.middleware.js";
import { swaggerOptions } from "./configs/swagger.config.js";
import { corsOptions } from "./configs/cors.config.js";
import { swaggerHandler } from "./middlewares/swagger.middleware.js";
import passport from "./configs/passport.config.js"; // Passport 설정 초기화

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(cookieParser()); // 쿠키 파서 추가 (반드시 필요!)
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 설정 (소셜 로그인용)
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // HTTPS에서는 true로 설정
}));

// Passport 미들웨어
app.use(passport.initialize());
app.use(passport.session());

app.use(stateHandler);

app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(null, swaggerOptions)
);

app.get("/openapi.json", swaggerHandler);

app.use("/v1/api/", apiRoute);

// 소셜 로그인 콜백 페이지 라우트
app.get("/auth/callback", (req, res) => {
  res.sendFile("auth-callback.html", { root: "public" });
});

// 프로필 설정 페이지 라우트
app.get("/auth/setup", (req, res) => {
  res.sendFile("setup.html", { root: "public" });
});

app.use(errorHandler);

// Initialize WebSocket server
initSocket(server, { corsOptions });

server.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
});
