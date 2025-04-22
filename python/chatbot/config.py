# ----------------------[환경변수 및 오디오 저장 경로 설정]--------------------
import os
from dotenv import load_dotenv # env 파일 로드를 위해서

# .env 파일 로드
load_dotenv()

# ----------------------[MariaDB 연결 정보 (env 파일에서 로드)]--------------------
MARIA_HOST = os.getenv('DB_HOST')
MARIA_PORT = int(os.getenv('DB_PORT'))
MARIA_USER = os.getenv('DB_USER')
MARIA_PASSWORD = os.getenv('DB_PASSWORD')
MARIA_DB = os.getenv('DB_NAME')

# -------------------------[경로 설정]--------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # abspath : 절대경로 반환, dirname : 디렉토리 경로만 반환
AUDIO_FILES_DIR = os.path.join(BASE_DIR, 'static', 'audio_files') # static/audiofiles