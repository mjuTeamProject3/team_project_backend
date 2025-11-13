# FortuneAPI/gemini_service.py
import os
import json
from dotenv import load_dotenv

# .env 파일 로드 (프로젝트 루트 우선, 없으면 FortuneAPI 폴더)
# 1. 프로젝트 루트의 .env 파일 로드 (Node.js 서버와 공유)
# FortuneAPI/gemini_service.py -> FortuneAPI/ -> 프로젝트 루트/
project_root = os.path.dirname(os.path.dirname(__file__))
root_env_path = os.path.join(project_root, '.env')
if os.path.exists(root_env_path):
    load_dotenv(dotenv_path=root_env_path, override=False)
    print(f"Loaded .env from project root: {root_env_path}")

# 2. FortuneAPI 폴더의 .env 파일 로드 (선택사항, 프로젝트 루트에 없을 때)
fortune_api_dir = os.path.dirname(__file__)
fortune_env_path = os.path.join(fortune_api_dir, '.env')
if os.path.exists(fortune_env_path):
    load_dotenv(dotenv_path=fortune_env_path, override=False)
    print(f"Loaded .env from FortuneAPI folder: {fortune_env_path}")

# 3. 환경변수에서도 로드 (override=False이므로 .env가 우선)
load_dotenv(override=False)

# Google Generative AI를 선택적으로 import
genai = None
try:
    import google.generativeai as genai
except ImportError:
    genai = None

# API 키 가져오기 (환경변수 또는 .env 파일에서)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")

# API 키 검증 및 설정
api_key_valid = False
if genai and GOOGLE_API_KEY:
    # API 키가 비어있지 않은지 확인
    if GOOGLE_API_KEY.strip():
        try:
            genai.configure(api_key=GOOGLE_API_KEY.strip())
            api_key_valid = True
        except Exception as e:
            print(f"Warning: Failed to configure Gemini API: {e}")
            genai = None
    else:
        print("Warning: GOOGLE_API_KEY is empty. Gemini features will be disabled.")
elif not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY is not set. Gemini features will be disabled.")
    print("Please set GOOGLE_API_KEY in project root .env file or environment variable.")


def recommend_topics(analysis_result: dict):
    """사주 기반 대화 주제 추천"""
    # genai가 없거나 API 키가 유효하지 않은 경우
    if not genai or not api_key_valid:
        return [{
            "topic": "대화 주제 추천 불가",
          
        }]
    
    try:
        prompt = f"""다음은 두 사람의 사주 궁합 분석 결과입니다:
        {json.dumps(analysis_result, ensure_ascii=False, indent=2)}
        
        이 사주결과를 바탕으로 두 사람이 대화하면 좋을 주제를 제안해 주세요.
        출력은 아래 JSON 형식으로만 하며, 다른 설명은 절대 하지 마세요.
        [
          {{ "topic": "짧고 자연스러운 제안형 문장, 예: 서로의 취미를 이야기해보시면 어떨까요?" }}
        ]
        """

        # 모델 이름 가져오기 (환경변수에서 지정 가능)
        # 환경변수가 없으면 기본 모델 목록 사용
        env_model = os.getenv("GEMINI_MODEL_NAME")

        # 사용 가능한 모델 목록 (우선순위 순)
        # Gemini 2.5 Flash가 최신 모델 (2025년 6월 안정 버전)
        if env_model:
            # 환경변수로 모델이 지정된 경우 먼저 시도
            model_names = [env_model]
        else:
            # 기본 모델 목록 (최신 모델부터)
            model_names = [
                "gemini-2.5-flash",     # 최신 Flash 모델 (2025년 안정 버전, 빠름)
                "gemini-2.0-flash-exp", # 실험적 2.0 Flash 모델
                "gemini-1.5-flash",     # 1.5 Flash 모델 (구버전)
                "gemini-1.5-pro",       # 1.5 Pro 모델
                "gemini-pro",           # 기본 모델 (v1 API, 가장 안정적)
            ]

        model = None
        response = None
        last_error = None

        # 모델 목록을 순회하며 사용 가능한 모델 찾기
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                print(f"✅ Successfully used model: {model_name}")
                break
            except Exception as e:
                last_error = e
                error_msg = str(e)
                # 404 오류는 다음 모델로 시도
                if "404" in error_msg or "not found" in error_msg.lower() or "not supported" in error_msg.lower():
                    print(f"⚠️  Model '{model_name}' not found (404), trying next model...")
                    continue
                else:
                    # 다른 오류는 즉시 실패 (API 키 오류 등)
                    print(f"❌ Model '{model_name}' failed: {error_msg}")
                    raise

        # 모든 모델이 실패한 경우
        if response is None:
            raise Exception(f"All models failed. Last error: {last_error}")

        # 응답 텍스트에서 JSON 추출
        response_text = response.text.strip()

        # JSON 코드 블록 제거 (```json ... ```)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        try:
            topics = json.loads(response_text)
            # 리스트가 아니면 리스트로 변환
            if not isinstance(topics, list):
                topics = [topics]
            return topics
        except json.JSONDecodeError as e:
            print(f"Warning: Failed to parse JSON response: {e}")
            print(f"Response text: {response_text}")
            return [{
                "topic": "추천 생성 실패",
                "reason": f"응답 파싱 오류: {str(e)}"
            }]
    except Exception as api_error:
        # API 키 오류를 구체적으로 처리
        error_message = str(api_error)
        
        # 모델을 찾을 수 없는 오류
        if "404" in error_message or "not found" in error_message.lower() or "not supported" in error_message.lower():
            print(f"Error: Model not found or not supported: {error_message}")
            return [{
                "topic": "모델 오류",
                "reason": f"Gemini 모델을 찾을 수 없습니다. 사용 가능한 모델로 변경 중입니다. 오류: {error_message}"
            }]
        # API 키 오류
        elif "API key" in error_message or "API_KEY" in error_message or "API key not valid" in error_message:
            print(f"Error: Invalid Gemini API key: {error_message}")
            return [{
                "topic": "API 키 오류",
                "reason": "Gemini API 키가 유효하지 않습니다. 프로젝트 루트의 .env 파일의 GOOGLE_API_KEY를 확인해주세요."
            }]
        # 기타 오류
        else:
            print(f"Error in recommend_topics: {api_error}")
            return [{
                "topic": "추천 생성 실패",
                "reason": f"Gemini API 호출 오류: {str(api_error)}"
            }]