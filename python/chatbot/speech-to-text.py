from flask import Flask, request, jsonify  # flask : 웹 애플리케이션 프레임 워크
from google.cloud import speech_v1  # Google Cloud Speech-to-Text API 클라이언트, pip install --upgrade google-cloud-speech
import io  # 파일 입출력
import sys
import os  # 운영체제
import uuid  # 고유 ID 생성
import cx_Oracle  # oracle DB 연결 라이브러리
from dotenv import load_dotenv  # env 파일 로드를 위해서
from flask_cors import CORS  # flask cors 라이브러리 추가
import traceback  # traceback 모듈 추가

# python 표준 출력 스트림(sys.stdout)의 인코딩을 UTF-8로 변경하는 코드
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)  # 파이썬 flask 서버 생성 (flask application name) : app
CORS(app, resources={r"/*": {"origins": "*"}})  # CORS 설정 추가, localhost:3000번 포트의 모든 origins 허용

# .env 파일 로드
load_dotenv()

# Oracle DB 연결 정보
ORACLE_USER = os.getenv('ORACLE_USER')
ORACLE_PASSWORD = os.getenv('ORACLE_PASSWORD')
ORACLE_DSN = os.getenv('ORACLE_DSN')

# Oracle DB에 연결하고 연결 객체를 반환하는 함수
def connect_to_oracle():
    try:
        connection = cx_Oracle.connect(ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN)
        print("Oracle DB 연결 성공")  # 연결 성공 메시지 추가
        return connection  # 오라클 db와 connection 값 반환
    except Exception as e:
        print(f"Oracle DB 연결 실패: {e}")
        return None

# 음성 텍스트 변환 결과와 파일 경로를 Oracle DB에 저장하는 함수
def save_to_db(transcript, filepath):
    connection = connect_to_oracle()  # connect_to_oracle 함수 호출
    if connection:
        try:
            # 커서 생성, 데이터베이스에서 데이터를 검색하거나 수정할 때, 커서는 결과 집합을 순차적으로 처리
            cursor = connection.cursor()
            # 현재 ID를 시퀀스로 db에 정의한 상태
            sql = "INSERT INTO chat_log (id, content, file_path, record) VALUES (CHAT_LOG_SEQ.NEXTVAL, :1, :2, 'Y')"  # record 추가
            cursor.execute(sql, (transcript, filepath))  # 쿼리 실행
            connection.commit()  # 변경사항 auto commit
            cursor.close()
            print("Oracle DB 저장 성공")
        except Exception as e:
            print(f"Oracle DB 저장 실패: {e}")
            traceback.print_exc()  # 예외 발생 시 traceback 출력

        finally:
            try:
                if connection:
                    connection.close()  # 항상 connection close
            except Exception as close_error:
                print(f"연결 종료 실패: {close_error}")

def trigger_spring_boot_data_fetch():
    try:
        response = request.post('http://localhost:8081/api/db_speech_data')  # post 요청으로 변경
        response.raise_for_status()
        print("스프링 부트 데이터 조회 요청 성공")
    except request.exceptions.RequestException as e:
        print(f"스프링 부트 데이터 조회 요청 실패: {e}")

# POST request speech file을 text로 변환하고 DB에 저장하는 엔드포인트
# jsonify : Flask에서 제공하는 함수, 파이썬 딕셔너리/리스트 데이터를 JSON 형식의 응답으로 변환
# 웹 API는 일반적으로 데이터를 JSON 형식으로 클라이언트에게 전송
@app.route('/speech_to_text', methods=['POST'])
def speech_to_text():
    # 오디오 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    # 오디오 파일 가져오기
    audio_file = request.files['audio']

    # 선택된 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 음성 파일 저장(생성)
        filename = str(uuid.uuid4()) + ".webm"  # google speech에서는 webm 파일 형식 제공
        # 파일 경로 변경
        filepath = os.path.join("D:\\Git\\TICO_TEAM\\python\\audio_files", filename)
        audio_file.save(filepath)  # 파일을 해당 경로로 저장

        # Google Cloud Speech-to-Text API 호출
        client = speech_v1.SpeechClient()  # !!! 시스템 환경 변수의 json api 키 호출
        with io.open(filepath, "rb") as audio_file:  # rb : read/binary | 음성 파일은 텍스트 데이터가 아닌 바이너리 데이터
            content = audio_file.read()  # 파일 읽기

        # RecognitionAudio(전송할 오디오 데이터) 객체 생성
        audio = speech_v1.RecognitionAudio(content=content)  # content : API에 전송할 실제 오디오 데이터(바이너리 형식)

        # RecognitionConfig(오디오 데이터의 설정 정보) 객체 생성
        # Google Cloud Speech-to-Text API에서 제공하는 형식과 일치 (불일치시 에러 발생)
        config = speech_v1.RecognitionConfig(
            encoding=speech_v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,  # 인코딩 방식 설정
            sample_rate_hertz=48000,  # 샘플링 레이트 설정
            language_code="ko-KR",  # 언어 코드 설정
        )

        # 음성 인식 요청
        response = client.recognize(config=config, audio=audio)
        transcript = "".join([result.alternatives[0].transcript for result in response.results])  # 인식 결과 추출

        # 변환된 결과, 데이터베이스 저장
        save_to_db(transcript, filepath)

        # 성공 시 변환된 텍스트 내용과 파일 경로 반환
        return jsonify({'transcript': transcript, 'filepath': filepath}), 200

    # 에러 발생 시 에러 메시지 반환
    except Exception as e:
        print(f"Flask 서버 오류: {e}")
        traceback.print_exc()  # 예외 발생 시 traceback 출력
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # 파일 경로 변경
    if not os.path.exists("D:\\Git\\TICO_TEAM\\python\\audio_files"):
        os.makedirs("D:\\Git\\TICO_TEAM\\python\\audio_files")
    app.run(debug=True, port=5000)  # Flask 애플리케이션 실행 (개발 모드, 5000번 포트)