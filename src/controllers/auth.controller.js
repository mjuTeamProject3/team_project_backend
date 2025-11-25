import { StatusCodes } from "http-status-codes";
import { bodyToSignUp, bodyToSignIn, bodyToRefresh } from "../dtos/auth.dto.js";
import { signUp, signIn, signOut, refresh, socialLogin, issueTokens } from "../services/auth.service.js";
import { InvalidRequestError } from "../errors/auth.error.js";
import { getUser } from "../repositories/user.repository.js";
import { checkProfileComplete } from "../services/user.service.js";
import { getOrCalculateSajuKeywords } from "../services/saju.service.js";

export const handleSignUp = async (req, res, next) => {
  /*
  #swagger.tags = ['Auth']
    #swagger.summary = '회원가입'
    #swagger.description = '회원가입을 위한 API입니다. 이메일, 이름, 비밀번호를 포함해 요청해야 합니다.'
    #swagger.security = []
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'email@email.com' },
              name: { type: 'string', example: '이름' },
              username: { type: 'string', example: 'username' },
              password: { type: 'string', example: '비밀번호' },
              avatar: { type: 'string', example: 'avatar.png' },
            },
            required: ['email', 'name', 'username', 'password']
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '회원가입 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'SUCCESS' },
              error: { type: 'object', example: null },
              success: {
                type: 'object',
                properties: {
                  userId: { type: 'number', example: 1 },
                  email: { type: 'string', example: 'email@email.com' },
                  name: { type: 'string', example: '이름' },
                  username: { type: 'string', example: 'username' },
                  avatar: { type: 'string', example: 'avatar.png' },
                  createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
                  updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
                }
              }
            }
          }
        }
      }
    }

    #swagger.responses[409] = {
      description: '이메일 중복',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'duplicate_email' },
                  reason: { type: 'string', example: '이미 존재하는 이메일입니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '잘못된 요청',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'invalid_request' },
                  reason: { type: 'string', example: '요청 데이터가 잘못되었습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
*/
  try {
    const auth = await signUp(bodyToSignUp(req.body));
    res.status(StatusCodes.OK).success(auth);
  } catch (err) {
    return next(err);
  }
};
export const handleSignIn = async (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = '로그인'
    #swagger.description = '로그인을 위한 API입니다. 이메일, 비밀번호를 포함해 요청해야 합니다.'
    #swagger.security = []
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'email@email.com' },
              password: { type: 'string', example: '비밀번호' },
            },
            required: ['email', 'password']
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '로그인 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'SUCCESS' },
              error: { type: 'object', example: null },
              success: {
                type: 'object',
                properties: {
                  userId: { type: 'number', example: 1 },
                  accessToken: { type: 'string', example: 'accessToken' },
                  refreshToken: { type: 'string', example: 'refreshToken' },
                  createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
                  updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' }
                }
              }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '잘못된 요청',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'invalid_request' },
                  reason: { type: 'string', example: '요청 데이터가 잘못되었습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
*/
  try {
    const auth = await signIn(bodyToSignIn(req.body));
    res.status(StatusCodes.OK).success(auth);
  } catch (err) {
    return next(err);
  }
};
export const handleSignOut = async (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = '로그아웃'
    #swagger.description = '로그아웃을 위한 API입니다.'

    #swagger.responses[200] = {
      description: '로그아웃 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'SUCCESS' },
              error: { type: 'object', example: null },
              success: {
                type: 'object',
                properties: {
                }
              }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '잘못된 요청',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'invalid_request' },
                  reason: { type: 'string', example: '요청 데이터가 잘못되었습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
    
    #swagger.responses[401] = {
      description: 'Access Token이 없습니다',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'unauthorized' },
                  reason: { type: 'string', example: 'Access Token이 없습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
    
    #swagger.responses[403] = {
      description: '토큰 형식이 올바르지 않습니다',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'not_access_token' },
                  reason: { type: 'string', example: 'Access Token 형식이 올바르지 않거나 유효하지 않습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
    
    #swagger.responses[419] = {
      description: '토큰이 만료 되었습니다',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'expired_access_token' },
                  reason: { type: 'string', example: 'Access Token이 만료되었습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
*/
  try {
    const auth = await signOut(req.user.userId);
    res.status(StatusCodes.OK).success(auth);
  } catch (err) {
    return next(err);
  }
};
export const handleRefresh = async (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = '리프레시 토큰 갱신'
    #swagger.description = '리프레시 토큰을 갱신하기 위한 API입니다.'
    #swagger.security = []
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              refreshToken: { type: 'string', example: 'refreshToken' },
            },
            required: ['refreshToken']
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '리프레시 토큰 갱신 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'SUCCESS' },
              error: { type: 'object', example: null },
              success: {
                type: 'object',
                properties: {
                  userId: { type: 'number', example: 1 },
                  accessToken: { type: 'string', example: 'accessToken' },
                  refreshToken: { type: 'string', example: 'refreshToken' },
                  createdAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
                  updatedAt: { type: 'string', example: '2023-01-01T00:00:00.000Z' }
                }
              }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '잘못된 요청',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'invalid_request' },
                  reason: { type: 'string', example: '요청 데이터가 잘못되었습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
    
    #swagger.responses[403] = {
      description: '유효하지 않은 리프레시 토큰입니다',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'not_refresh_token' },
                  reason: { type: 'string', example: '유효하지 않은 리프레시 토큰입니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
*/
  try {
    const auth = await refresh(bodyToRefresh(req.body));
    res.status(StatusCodes.OK).success(auth);
  } catch (err) {
    return next(err);
  }
};
export const handleProtect = async (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = '엑세스 토큰 확인'
    #swagger.description = '엑세스 토큰을 확인하기 위한 API입니다.'

    #swagger.responses[200] = {
      description: '엑세스 토큰 확인 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'SUCCESS' },
              error: { type: 'object', example: null },
              success: {
                type: 'object',
                properties: {
                }
              }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: '잘못된 요청',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'invalid_request' },
                  reason: { type: 'string', example: '요청 데이터가 잘못되었습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
    
    #swagger.responses[401] = {
      description: 'Access Token이 없습니다',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'unauthorized' },
                  reason: { type: 'string', example: 'Access Token이 없습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
    
    #swagger.responses[403] = {
      description: '토큰 형식이 올바르지 않습니다',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'not_access_token' },
                  reason: { type: 'string', example: 'Access Token 형식이 올바르지 않거나 유효하지 않습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
    
    #swagger.responses[419] = {
      description: '토큰이 만료 되었습니다',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'FAIL' },
              error: {
                type: 'object',
                properties: {
                  errorCode: { type: 'string', example: 'expired_access_token' },
                  reason: { type: 'string', example: 'Access Token이 만료되었습니다.' },
                  data: { type: 'object', example: null }
                }
              },
              success: { type: 'object', example: null }
            }
          }
        }
      }
    }
*/
  try {
    const auth = req.user.userId;
    if (auth) {
      res.status(StatusCodes.OK).success({});
    } else {
      return next(new InvalidRequestError());
    }
  } catch (err) {
    return next(err);
  }
};

// 소셜 로그인 콜백 핸들러
export const handleSocialCallback = async (req, res, next) => {
  try {
    // 🔍 디버깅: 콜백 수신 정보 확인
    console.log('📥 콜백 수신 - req.query.state:', req.query.state);
    console.log('📥 콜백 수신 - req.query 전체:', JSON.stringify(req.query));
    console.log('💾 세션 ID:', req.sessionID);
    console.log('💾 세션에서 state 확인:', req.session?.oauthState);
    console.log('🍪 쿠키에서 state 확인:', req.cookies?.oauth_state);
    
    // OAuth state 파라미터에서 플랫폼 정보 및 추가 정보 디코딩
    // state는 req.query.state → 쿠키 → 세션 순서로 확인
    let stateParam = req.query.state;
    if (!stateParam) {
      // 쿠키에서 가져오기 (우선순위 높음)
      stateParam = req.cookies?.oauth_state;
      if (stateParam) {
        console.log('✅ 쿠키에서 state 가져옴');
        // 쿠키 삭제 (사용 후 정리)
        res.clearCookie('oauth_state');
      } else {
        // 세션에서 가져오기 (백업)
        stateParam = req.session?.oauthState;
        if (stateParam) {
          console.log('✅ 세션에서 state 가져옴');
        }
      }
    }
    let platform = 'web';
    let additionalInfo = null;
    
    try {
      if (stateParam) {
        console.log('🔐 State 디코딩 시도:', stateParam);
        const decodedState = JSON.parse(Buffer.from(stateParam, 'base64').toString());
        console.log('✅ State 디코딩 성공:', JSON.stringify(decodedState));
        platform = decodedState.platform || 'web';
        console.log('📱 Platform 설정:', platform);
        
        // 추가 정보 추출
        if (decodedState.nickname || decodedState.birthdate || decodedState.location || decodedState.gender) {
          additionalInfo = {
            username: decodedState.nickname || null,
            birthdate: decodedState.birthdate || null,
            location: decodedState.location || null,
            gender: decodedState.gender || null,
          };
          console.log('📝 추가 정보 추출:', JSON.stringify(additionalInfo));
        }
        
        // 세션에서 state 제거 (사용 후 정리)
        if (req.session?.oauthState) {
          delete req.session.oauthState;
        }
      } else {
        console.warn('⚠️ req.query.state와 세션 모두에 state가 없습니다!');
        console.warn('⚠️ req.query 전체:', JSON.stringify(req.query));
      }
    } catch (err) {
      console.error('❌ State 파라미터 디코딩 실패:', err.message);
      console.error('❌ State 원본:', stateParam);
      console.error('❌ 에러 스택:', err.stack);
      // 기본값 사용
      platform = 'web';
      console.log('🔄 Fallback - Platform:', platform);
    }
    
    console.log('🎯 최종 Platform:', platform);
    
    if (!req.user) {
      // 모바일 앱인 경우 딥링크로 에러 리다이렉트
      if (platform === 'mobile') {
        const errorUrl = `fatetry://auth/error?error=${encodeURIComponent("소셜 로그인에 실패했습니다.")}`;
        return res.redirect(errorUrl);
      }
      // 웹인 경우 기존대로 JSON 응답
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAIL",
        error: {
          errorCode: "social_login_failed",
          reason: "소셜 로그인에 실패했습니다.",
          data: null,
        },
        success: null,
      });
    }

    // 사용자 찾기/생성 (추가 정보 포함, 토큰 발급 안 함)
    const user = await socialLogin(req.user, additionalInfo);
    
    // 프로필 완성도 체크
    const profileStatus = checkProfileComplete(user);
    
    // 추가 정보를 state로 받았으므로 프로필이 완성되어 있어야 함
    if (profileStatus.isComplete) {
      // 프로필 완성 → 사주 키워드 계산 및 저장
      try {
        const sajuKeywords = await getOrCalculateSajuKeywords({ userId: user.id });
        if (sajuKeywords && sajuKeywords.length > 0) {
          console.log('✅ 사주 키워드 계산 완료:', sajuKeywords);
        } else {
          console.warn('⚠️ 사주 키워드 계산 실패 또는 결과 없음');
        }
      } catch (err) {
        console.error('❌ 사주 키워드 계산 중 에러:', err.message);
        // 에러가 발생해도 로그인은 계속 진행
      }
      
      // 프로필 완성 → 토큰 발급 후 리다이렉트
      const auth = await issueTokens(user.id);
      
      if (platform === 'mobile') {
        // 모바일 앱: 딥링크 스킴 사용
        const redirectUrl = `fatetry://auth/callback?accessToken=${auth.accessToken}&refreshToken=${auth.refreshToken}&profileComplete=true`;
        console.log('📱 모바일 딥링크 리다이렉트:', redirectUrl);
        res.redirect(redirectUrl);
      } else {
        // 웹 브라우저: 기존 HTML 페이지로 (테스트용)
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const redirectUrl = `${baseUrl}/auth/callback?accessToken=${auth.accessToken}&refreshToken=${auth.refreshToken}`;
        console.log('🌐 웹 리다이렉트:', redirectUrl);
        res.redirect(redirectUrl);
      }
    } else {
      // 프로필 미완성 → 세션에 사용자 ID 저장 후 리다이렉트 (fallback)
      req.session.socialUserId = user.id;
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        
        if (platform === 'mobile') {
          // 모바일 앱: 딥링크로 프로필 설정 페이지로
          const redirectUrl = `fatetry://auth/setup?missing=${profileStatus.missingFields.join(',')}`;
          res.redirect(redirectUrl);
        } else {
          // 웹 브라우저: 기존 HTML 페이지로
          const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          const redirectUrl = `${baseUrl}/auth/setup?missing=${profileStatus.missingFields.join(',')}`;
          res.redirect(redirectUrl);
        }
      });
    }
  } catch (err) {
    return next(err);
  }
};

// 소셜 로그인 에러 핸들러
export const handleSocialError = (err, req, res, next) => {
  // OAuth state 파라미터에서 플랫폼 정보 디코딩
  let platform = 'web';
  try {
    if (req.query.state) {
      const decodedState = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
      platform = decodedState.platform || 'web';
    }
  } catch (err) {
    console.warn('⚠️ State 파라미터 디코딩 실패, 기본값(web) 사용:', err.message);
    // 세션에서도 시도 (fallback)
    platform = req.session?.platform || 'web';
  }
  
  if (platform === 'mobile') {
    // 모바일 앱: 딥링크로 에러 리다이렉트
    const errorUrl = `fatetry://auth/error?error=${encodeURIComponent(err.message || "소셜 로그인에 실패했습니다.")}`;
    res.redirect(errorUrl);
  } else {
    // 웹 브라우저: 기존 HTML 페이지로
    const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/error?error=${encodeURIComponent(err.message || "소셜 로그인에 실패했습니다.")}`;
    res.redirect(redirectUrl);
  }
};
