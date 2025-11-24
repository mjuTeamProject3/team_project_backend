import express from "express";
import passport from "../configs/passport.config.js";
import {
  handleSignUp,
  handleSignIn,
  handleSignOut,
  handleRefresh,
  handleProtect,
  handleSocialCallback,
  handleSocialError,
} from "../controllers/auth.controller.js";
import { handleSetupProfile } from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
const route = express.Router();

// 일반 회원가입/로그인 비활성화 (소셜 로그인만 사용)
// route.post("/signup", handleSignUp);
// route.post("/signin", handleSignIn);

// 소셜 로그인 후 프로필 설정 및 토큰 발급
route.post("/setup", handleSetupProfile);

route.post("/signout", verifyAccessToken, handleSignOut);
route.post("/refresh", handleRefresh);
route.get("/protected", verifyAccessToken, handleProtect);

// 구글 소셜 로그인
route.get("/google", (req, res, next) => {
  // state 파라미터를 세션에 저장
  if (req.query.state) {
    req.session.oauthState = req.query.state;
    req.session.save((err) => {
      if (err) {
        console.error('세션 저장 오류:', err);
        return next(err);
      }
      console.log('💾 State 세션에 저장:', req.query.state);
      passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    });
  } else {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  }
});
route.get(
  "/google/callback",
  passport.authenticate("google", { session: true, failureRedirect: "/v1/api/auth/google/error" }),
  handleSocialCallback
);
route.get("/google/error", handleSocialError);

// 카카오 소셜 로그인
route.get("/kakao", (req, res, next) => {
  // state 파라미터를 세션에 저장
  if (req.query.state) {
    req.session.oauthState = req.query.state;
    req.session.save((err) => {
      if (err) {
        console.error('세션 저장 오류:', err);
        return next(err);
      }
      console.log('💾 State 세션에 저장:', req.query.state);
      passport.authenticate("kakao")(req, res, next);
    });
  } else {
    passport.authenticate("kakao")(req, res, next);
  }
});
route.get(
  "/kakao/callback",
  passport.authenticate("kakao", { session: true, failureRedirect: "/v1/api/auth/kakao/error" }),
  handleSocialCallback
);
route.get("/kakao/error", handleSocialError);

// 네이버 소셜 로그인
route.get("/naver", (req, res, next) => {
  // state 파라미터를 세션에 저장
  if (req.query.state) {
    req.session.oauthState = req.query.state;
    req.session.save((err) => {
      if (err) {
        console.error('세션 저장 오류:', err);
        return next(err);
      }
      console.log('💾 State 세션에 저장:', req.query.state);
      passport.authenticate("naver")(req, res, next);
    });
  } else {
    passport.authenticate("naver")(req, res, next);
  }
});
route.get(
  "/naver/callback",
  passport.authenticate("naver", { session: true, failureRedirect: "/v1/api/auth/naver/error" }),
  handleSocialCallback
);
route.get("/naver/error", handleSocialError);

export default route;
