# ----------------------------[Flask 앱 초기화 및 Blueprint 등록]----------------------------
# flask : 웹 애플리케이션 프레임 워크, send_from_directory : 음성 파일을 제공
from flask import Flask, send_from_directory
from flask_cors import CORS  # flask cors 라이브러리 추가
import os  # 운영체제

# py 파일 호출
from config import AUDIO_FILES_DIR
from routes import routes

# 파이썬 flask 서버 생성 (flask application name)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) # CORS 설정을 통해 모든 도메인에서 오는 요청 허용(*).

# AUDIO_FILES_DIR 경로에 해당하는 폴더가 없으면 생성.
try:
    os.makedirs(AUDIO_FILES_DIR, exist_ok=True)  # exist_ok=True: 폴더가 존재해도 에러 없이 넘어감.
except Exception as e:
    print(f"오디오 폴더 생성 실패: {e}", flush=True)  # flush=True : 출력 결과를 즉시 콘솔(또는 로그)에 강제로 내보내는 옵션

app.register_blueprint(routes)  # 라우터 등록 (Blueprint)

# 음성 파일 제공 
@app.route("/audio/<nickname>/<filename>")
def get_audio_file(nickname, filename):
    try:
        user_dir = os.path.join(AUDIO_FILES_DIR, nickname)  # static/audio_files/닉네임/
        return send_from_directory(user_dir, filename)
    except Exception as e:
        return {"error": "파일을 찾을 수 없습니다."}, 404

# 앱 실행 
if __name__ == '__main__':
    app.run(debug=True, port=5000) # 5000번 포트로 실행
