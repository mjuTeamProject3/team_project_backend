import { StatusCodes } from "http-status-codes";
import { bodyToSignUp, bodyToSignIn, bodyToRefresh } from "../dtos/auth.dto.js";
import { signUp, signIn, signOut, refresh, socialLogin } from "../services/auth.service.js";
import { InvalidRequestError } from "../errors/auth.error.js";

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

    const auth = await socialLogin(req.user);
    
    // 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터나 리다이렉트 URL로 전달)
    const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?accessToken=${auth.accessToken}&refreshToken=${auth.refreshToken}`;
    
    res.redirect(redirectUrl);
  } catch (err) {
    return next(err);
  }
};

// 소셜 로그인 에러 핸들러
export const handleSocialError = (err, req, res, next) => {
  const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/error?error=${encodeURIComponent(err.message || "소셜 로그인에 실패했습니다.")}`;
  res.redirect(redirectUrl);
};
