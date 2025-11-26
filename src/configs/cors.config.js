export const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true, // 세션 쿠키 사용을 위해 필요
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
