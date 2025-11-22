import { StatusCodes } from "http-status-codes";
import { bodyToSignUp, bodyToSignIn, bodyToRefresh } from "../dtos/auth.dto.js";
import { signUp, signIn, signOut, refresh, socialLogin, issueTokens } from "../services/auth.service.js";
import { InvalidRequestError } from "../errors/auth.error.js";
import { getUser } from "../repositories/user.repository.js";
import { checkProfileComplete } from "../services/user.service.js";

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
    if (!req.user) {
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

    // 사용자 찾기/생성 (토큰 발급 안 함)
    const user = await socialLogin(req.user);
    
    // 프로필 완성도 체크
    const profileStatus = checkProfileComplete(user);
    
    // HTML 페이지를 거쳐 앱으로 리다이렉트 (브라우저 컨텍스트 유지)
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    if (profileStatus.isComplete) {
      // 프로필 완성 → 토큰 발급 후 메인 페이지로
      const auth = await issueTokens(user.id);
      const redirectUrl = `${baseUrl}/auth/callback?accessToken=${auth.accessToken}&refreshToken=${auth.refreshToken}&profileComplete=true`;
      res.redirect(redirectUrl);
    } else {
      // 프로필 미완성 → 토큰 발급 후 프로필 정보 입력 페이지로
      const auth = await issueTokens(user.id);
      const redirectUrl = `${baseUrl}/auth/callback?accessToken=${auth.accessToken}&refreshToken=${auth.refreshToken}&profileComplete=false&missingFields=${encodeURIComponent(profileStatus.missingFields.join(','))}`;
      res.redirect(redirectUrl);
    }
  } catch (err) {
    return next(err);
  }
};

// 소셜 로그인 에러 핸들러
export const handleSocialError = (err, req, res, next) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const redirectUrl = `${baseUrl}/auth/error?error=${encodeURIComponent(err.message || "소셜 로그인에 실패했습니다.")}`;
  res.redirect(redirectUrl);
};
