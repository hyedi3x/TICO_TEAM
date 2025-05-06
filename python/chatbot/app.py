# ----------------------------[Flask 앱 초기화 및 Blueprint 등록]----------------------------
import os  # 운영체제
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# flask : 웹 애플리케이션 프레임 워크, send_from_directory : 음성 파일을 제공
from flask import Flask, send_from_directory
from flask_cors import CORS  # flask cors 라이브러리 추가

# py 파일 호출
from config import AUDIO_FILES_DIR
from routes import routes  # chatbot 폴더의 하위 routes.py
from dashboard.routes import dashboard_bp  # dashboard 폴더 하위의 routes.py 

# 파이썬 flask 서버 생성 (flask application name)
app = Flask(__name__)
CORS(app, resources={
    r"/flask/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],    # Get, Post, Options 메서드 허용
        "allow_headers": ["Content-Type", "Authorization", "Accept"], # 허용된 헤더 목록
        "expose_headers": ["Content-Type"], # 노출된 헤더 목록
        "max_age": 3600 # 캐시 최대 나이
    }
})

# AUDIO_FILES_DIR 경로에 해당하는 폴더가 없으면 생성.
try:
    os.makedirs(AUDIO_FILES_DIR, exist_ok=True)  # exist_ok=True: 폴더가 존재해도 에러 없이 넘어감.
except Exception as e:
    print(f"오디오 폴더 생성 실패: {e}", flush=True)  # flush=True : 출력 결과를 즉시 콘솔(또는 로그)에 강제로 내보내는 옵션

app.register_blueprint(routes, url_prefix='/flask')  # 라우트 등록, url_prefix : 라우트 접두사(공통 경로)
app.register_blueprint(dashboard_bp, url_prefix='/flask')  # dashboard 라우트 등록

# 음성 파일 제공 
@app.route("/flask/audio/<nickname>/<filename>")
def get_audio_file(nickname, filename):
    try:
        user_dir = os.path.join(AUDIO_FILES_DIR, nickname)  # static/audio_files/닉네임/
        return send_from_directory(user_dir, filename)
    except Exception as e:
        return {"error": "파일을 찾을 수 없습니다."}, 404

# 앱 실행 
if __name__ == '__main__':
    print(app.url_map)      # 등록된 라우트 확인
    app.run(host="0.0.0.0", debug=True, port=5000) # 5000번 포트로 실행
