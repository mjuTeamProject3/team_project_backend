import { StatusCodes } from "http-status-codes";
import {
  bodyToBirthInfo,
  bodyToCompatibility,
} from "../dtos/fortune.dto.js";
import {
  calculateUserFortune,
  checkUserCompatibility,
  getSajuTopics,
} from "../services/fortune.service.js";
import { InvalidRequestError } from "../errors/auth.error.js";

/**
 * 사주 계산 컨트롤러
 */
export const handleCalculateFortune = async (req, res, next) => {
  /*
    #swagger.tags = ['Fortune']
    #swagger.summary = '사주 계산'
    #swagger.description = '생년월일시 정보를 바탕으로 사주를 계산합니다.'
    #swagger.security = []
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              year: { type: 'number', example: 1998 },
              month: { type: 'number', example: 2 },
              day: { type: 'number', example: 1 },
              hour: { type: 'number', example: 14 },
              minute: { type: 'number', example: 30 },
              isLunar: { type: 'boolean', example: false }
            },
            required: ['year', 'month', 'day', 'hour']
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '사주 계산 성공',
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
                  heavenlyStems: {
                    type: 'object',
                    properties: {
                      year: { type: 'string', example: '甲' },
                      month: { type: 'string', example: '乙' },
                      day: { type: 'string', example: '丙' },
                      hour: { type: 'string', example: '丁' }
                    }
                  },
                  earthlyBranches: {
                    type: 'object',
                    properties: {
                      year: { type: 'string', example: '子' },
                      month: { type: 'string', example: '丑' },
                      day: { type: 'string', example: '寅' },
                      hour: { type: 'string', example: '卯' }
                    }
                  },
                  fiveElements: {
                    type: 'object',
                    properties: {
                      year: { type: 'string', example: '木' },
                      month: { type: 'string', example: '木' },
                      day: { type: 'string', example: '火' },
                      hour: { type: 'string', example: '火' }
                    }
                  },
                  zodiacSign: { type: 'string', example: '子' },
                  animalSign: { type: 'string', example: '쥐' }
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
                  reason: { type: 'string', example: '사주 계산에 실패했습니다.' },
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
    const birthInfo = bodyToBirthInfo(req.body);
    const fortune = await calculateUserFortune(birthInfo);
    res.status(StatusCodes.OK).success(fortune);
  } catch (err) {
    return next(err);
  }
};

/**
 * 궁합 분석 컨트롤러
 */
export const handleCompatibility = async (req, res, next) => {
  /*
    #swagger.tags = ['Fortune']
    #swagger.summary = '궁합 분석'
    #swagger.description = '두 사용자의 생년월일시 정보를 바탕으로 궁합을 분석합니다.'
    #swagger.security = []
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              user1: {
                type: 'object',
                properties: {
                  year: { type: 'number', example: 1998 },
                  month: { type: 'number', example: 2 },
                  day: { type: 'number', example: 1 },
                  hour: { type: 'number', example: 14 },
                  minute: { type: 'number', example: 30 },
                  isLunar: { type: 'boolean', example: false }
                },
                required: ['year', 'month', 'day', 'hour']
              },
              user2: {
                type: 'object',
                properties: {
                  year: { type: 'number', example: 1995 },
                  month: { type: 'number', example: 7 },
                  day: { type: 'number', example: 15 },
                  hour: { type: 'number', example: 9 },
                  minute: { type: 'number', example: 0 },
                  isLunar: { type: 'boolean', example: false }
                },
                required: ['year', 'month', 'day', 'hour']
              }
            },
            required: ['user1', 'user2']
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '궁합 분석 성공',
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
                  score: { type: 'number', example: 78 },
                  level: { type: 'string', example: 'high' },
                  analysis: {
                    type: 'object',
                    properties: {
                      overall: { type: 'string', example: '좋은 궁합입니다' },
                      strengths: { type: 'array', items: { type: 'string' } },
                      weaknesses: { type: 'array', items: { type: 'string' } },
                      advice: { type: 'string', example: '소통을 통해 극복하세요' }
                    }
                  },
                  details: {
                    type: 'object',
                    properties: {
                      heavenlyStems: { type: 'number', example: 70 },
                      earthlyBranches: { type: 'number', example: 80 },
                      fiveElements: { type: 'number', example: 75 },
                      zodiacSign: { type: 'number', example: 85 }
                    }
                  }
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
                  reason: { type: 'string', example: '궁합 분석에 실패했습니다.' },
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
    const { user1, user2 } = bodyToCompatibility(req.body);
    if (!user1 || !user2) {
      throw new InvalidRequestError("user1과 user2 정보가 필요합니다.");
    }
    const compatibility = await checkUserCompatibility(user1, user2);
    res.status(StatusCodes.OK).success(compatibility);
  } catch (err) {
    return next(err);
  }
};

/**
 * 사주 기반 대화 주제 추천 컨트롤러
 */
export const handleRecommendTopics = async (req, res, next) => {
  /*
    #swagger.tags = ['Fortune']
    #swagger.summary = '사주 기반 대화 주제 추천'
    #swagger.description = '궁합 분석 결과를 바탕으로 대화 주제를 추천합니다.'
    #swagger.security = []
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              score: { type: 'number', example: 78 },
              level: { type: 'string', example: 'high' },
              analysis: {
                type: 'object',
                properties: {
                  overall: { type: 'string', example: '좋은 궁합입니다' },
                  strengths: { type: 'array', items: { type: 'string' } },
                  weaknesses: { type: 'array', items: { type: 'string' } },
                  advice: { type: 'string', example: '소통을 통해 극복하세요' }
                }
              },
              details: {
                type: 'object',
                properties: {
                  heavenlyStems: { type: 'number', example: 70 },
                  earthlyBranches: { type: 'number', example: 80 },
                  fiveElements: { type: 'number', example: 75 },
                  zodiacSign: { type: 'number', example: 85 }
                }
              }
            }
          }
        }
      }
    }

    #swagger.responses[200] = {
      description: '대화 주제 추천 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              resultType: { type: 'string', example: 'SUCCESS' },
              error: { type: 'object', example: null },
              success: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    topic: { type: 'string', example: '여행 계획' },
                    reason: { type: 'string', example: '두 사람의 오행이 상생 관계여서...' }
                  }
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
                  reason: { type: 'string', example: '대화 주제 추천에 실패했습니다.' },
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
    const analysisResult = req.body;
    if (!analysisResult) {
      throw new InvalidRequestError("분석 결과가 필요합니다.");
    }
    const topics = await getSajuTopics(analysisResult);
    res.status(StatusCodes.OK).success(topics);
  } catch (err) {
    return next(err);
  }
};

