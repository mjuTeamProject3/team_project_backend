import { StatusCodes } from "http-status-codes";
import { otherUserProfile, userProfile, updateProfile, checkProfileComplete } from "../services/user.service.js";
import { likeUser, unlikeUser } from "../services/like.service.js";
import { bodyToProfileUpdate } from "../dtos/user.dto.js";
import { issueTokens } from "../services/auth.service.js";
import { getUser } from "../repositories/user.repository.js";

export const handleUserProfile = async (req, res, next) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = '유저 프로필 조회'
    #swagger.description = '유저 프로필 조회를 위한 API입니다.'

    #swagger.responses[200] = {
      description: '유저 프로필 조회 성공',
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
    const user = await userProfile(req.user.userId);
    res.status(StatusCodes.OK).success(user);
  } catch (err) {
    return next(err);
  }
};

export const handleUserProfileById = async (req, res, next) => {
  try {
    const user = await otherUserProfile({ targetUserId: Number(req.params.id) });
    res.status(StatusCodes.OK).success(user);
  } catch (err) {
    return next(err);
  }
};

export const handleLikeUser = async (req, res, next) => {
  try {
    await likeUser({ fromUserId: req.user.userId, toUserId: Number(req.params.id) });
    res.status(StatusCodes.OK).success({});
  } catch (err) {
    return next(err);
  }
};

export const handleUnlikeUser = async (req, res, next) => {
  try {
    await unlikeUser({ fromUserId: req.user.userId, toUserId: Number(req.params.id) });
    res.status(StatusCodes.OK).success({});
  } catch (err) {
    return next(err);
  }
};

// 세션 기반 프로필 업데이트 (소셜 로그인 후 추가 정보 입력)
export const handleSetupProfile = async (req, res, next) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = '프로필 추가 정보 입력 및 토큰 발급'
    #swagger.description = '소셜 로그인 후 생년월일, 닉네임, 지역을 입력하고 토큰을 발급받습니다.'
    #swagger.security = []
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: { type: 'string', example: 'nickname123' },
              birthdate: { type: 'string', format: 'date', example: '1998-02-01' },
              location: { type: 'string', example: '서울' },
              gender: { type: 'string', example: '남성' }
            }
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: '프로필 업데이트 및 토큰 발급 성공',
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
                  accessToken: { type: 'string', example: 'jwt_token' },
                  refreshToken: { type: 'string', example: 'jwt_token' }
                }
              }
            }
          }
        }
      }
    }
  */
  try {
    // 세션에서 사용자 ID 가져오기
    const userId = req.session?.socialUserId;
    
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAIL",
        error: {
          errorCode: "session_expired",
          reason: "세션이 만료되었습니다. 소셜 로그인을 다시 시도해주세요.",
          data: null,
        },
        success: null,
      });
    }
    
    const profileData = bodyToProfileUpdate(req.body);
    
    // 프로필 업데이트
    await updateProfile({
      userId,
      username: profileData.username,
      birthdate: profileData.birthdate,
      location: profileData.location,
      gender: profileData.gender,
    });
    
    // 프로필 완성도 재확인
    const user = await getUser(userId);
    const profileStatus = checkProfileComplete(user);
    
    if (!profileStatus.isComplete) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        resultType: "FAIL",
        error: {
          errorCode: "profile_incomplete",
          reason: "필수 정보가 모두 입력되지 않았습니다.",
          data: null,
        },
        success: null,
      });
    }
    
    // 토큰 발급
    const auth = await issueTokens(userId);
    
    // 세션 정리
    req.session.socialUserId = null;
    req.session.save();
    
    res.status(StatusCodes.OK).success(auth);
  } catch (err) {
    return next(err);
  }
};

// 인증된 사용자의 프로필 업데이트 (기존)
export const handleUpdateProfile = async (req, res, next) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = '프로필 수정'
    #swagger.description = '인증된 사용자가 프로필을 수정합니다.'
  */
  try {
    const userId = req.user.userId;
    const profileData = bodyToProfileUpdate(req.body);
    
    const profile = await updateProfile({
      userId,
      username: profileData.username,
      birthdate: profileData.birthdate,
      location: profileData.location,
      gender: profileData.gender,
    });
    
    res.status(StatusCodes.OK).success(profile);
  } catch (err) {
    return next(err);
  }
};
