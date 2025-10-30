import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import KakaoStrategy from "passport-kakao";
import NaverStrategy from "passport-naver";

// 구글 전략
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy.Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/v1/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = {
            provider: "google",
            socialId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName || profile.name?.givenName || "",
            avatar: profile.photos?.[0]?.value || null,
          };
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Google OAuth 설정이 없습니다. GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 확인하세요.");
}

// 카카오 전략
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  passport.use(
    new KakaoStrategy.Strategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: process.env.KAKAO_CALLBACK_URL || "http://localhost:3000/v1/api/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = {
            provider: "kakao",
            socialId: profile.id,
            email: profile._json?.kakao_account?.email || `${profile.id}@kakao.com`,
            name: profile._json?.kakao_account?.profile?.nickname || profile.username || "",
            avatar: profile._json?.kakao_account?.profile?.profile_image_url || null,
          };
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Kakao OAuth 설정이 없습니다. KAKAO_CLIENT_ID와 KAKAO_CLIENT_SECRET을 확인하세요.");
}

// 네이버 전략
if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
  passport.use(
    new NaverStrategy.Strategy(
      {
        clientID: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET,
        callbackURL: process.env.NAVER_CALLBACK_URL || "http://localhost:3000/v1/api/auth/naver/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = {
            provider: "naver",
            socialId: profile.id,
            email: profile.emails?.[0]?.value || `${profile.id}@naver.com`,
            name: profile.displayName || profile._json?.name || "",
            avatar: profile._json?.profile_image || null,
          };
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Naver OAuth 설정이 없습니다. NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 확인하세요.");
}

export default passport;

