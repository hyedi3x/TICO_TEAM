# ----------------------------[챗봇 음성 텍스트 변환 코드]----------------------------
from flask import Flask, request, jsonify  # flask : 웹 애플리케이션 프레임 워크
from flask_cors import CORS  # flask cors 라이브러리 추가
from google.cloud import speech_v1  # Google Cloud Speech-to-Text API 클라이언트
import io  # 파일 입출력
import sys
import os  # 운영체제
import uuid  # 고유 ID 생성
import pymysql  # MariaDB 연결 라이브러리
from dotenv import load_dotenv  # env 파일 로드를 위해서
import traceback  # traceback 모듈 추가

# python 표준 출력 스트림(sys.stdout)의 인코딩을 UTF-8로 변경
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)  # 파이썬 flask 서버 생성 (flask application name) : app
CORS(app, resources={r"/*": {"origins": "*"}})  # CORS 설정 추가, localhost:3000번 포트의 모든 origins 허용

# .env 파일 로드
load_dotenv()

# MariaDB 연결 정보 (env 파일에서 로드)
MARIA_HOST = os.getenv('DB_HOST')
MARIA_PORT = int(os.getenv('DB_PORT'))
MARIA_USER = os.getenv('DB_USER')
MARIA_PASSWORD = os.getenv('DB_PASSWORD')
MARIA_DB = os.getenv('DB_NAME')

# MariaDB에 연결하고 연결 객체를 반환하는 함수
def connect_to_maria():
    try:
        connection = pymysql.connect(
            host=MARIA_HOST,
            port=MARIA_PORT,
            user=MARIA_USER,
            password=MARIA_PASSWORD,
            db=MARIA_DB,
            charset='utf8'  # UTF8 인코딩 사용
        )
        print("MariaDB 연결 성공", flush=True)   # flush=True : 출력 결과를 즉시 콘솔(또는 로그)에 강제로 내보내는 옵션
        return connection
    except Exception as e:
        print(f"MariaDB 연결 실패: {e}", flush=True)
        return None

# 음성 텍스트 변환 결과와 파일 경로를 MariaDB에 저장하는 함수
def save_to_db(user_uuid, transcript, filepath):
    connection = connect_to_maria()
    if connection:
        try:
            # 커서 생성, 데이터베이스에서 데이터를 검색하거나 수정할 때, 커서는 결과 집합을 순차적으로 처리
            with connection.cursor() as cursor:
                # insert 구문 : user_uuid, 메시지, 음성파일 경로, 음성/텍스트 여부, user/bot 여부
                sql = """
                    INSERT INTO chat_log (user_uuid, msg, file_path, record, sender)
                    VALUES (%s, %s, %s, 'Y', 'user')
                """
                cursor.execute(sql, (user_uuid, transcript, filepath))
            connection.commit()  # 변경사항 auto commit
            print("MariaDB 저장 성공", flush=True)
        except Exception as e:
            print(f"MariaDB 저장 실패: {e}", flush=True)
            traceback.print_exc()  # 예외 발생 시 traceback 출력
        finally:
            try:
                connection.close()  # 항상 connection close
            except Exception as close_error:
                print(f"연결 종료 실패: {close_error}", flush=True)

# POST request speech file을 text로 변환하고 DB에 저장
# jsonify : Flask에서 제공하는 함수, 파이썬 딕셔너리/리스트 데이터를 JSON 형식의 응답으로 변환
# 웹 API는 일반적으로 데이터를 JSON 형식으로 클라이언트에게 전송
@app.route('/speech_to_text', methods=['POST'])
def speech_to_text():

    user_uuid = request.form.get('user_uuid')  # user_uuid를 form 데이터로 받음

    # 오디오 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    audio_file = request.files['audio']  # 오디오 파일 가져오기

    # 선택된 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 음성 파일 저장
        filename = str(uuid.uuid4()) + ".webm"
        filepath = os.path.join("D:\\Git\\TICO_TEAM\\python\\audio_files", filename)
        audio_file.save(filepath) # 파일을 해당 경로로 저장

        # Google Cloud Speech-to-Text API 호출
        client = speech_v1.SpeechClient()
        with io.open(filepath, "rb") as audio_file:  # rb : read/binary | 음성 파일은 텍스트 데이터가 아닌 바이너리 데이터
            content = audio_file.read()  # 파일 읽기

        # audio : RecognitionAudio(전송할 오디오 데이터) 객체 생성
        audio = speech_v1.RecognitionAudio(content=content)  # content : API에 전송할 실제 오디오 데이터(바이너리 형식)

        # config: RecognitionConfig(오디오 데이터의 설정 정보) 객체 생성
        # Google Cloud Speech-to-Text API에서 제공하는 형식과 일치 (불일치시 에러 발생)
        config = speech_v1.RecognitionConfig(
            encoding=speech_v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,  # 인코딩 방식 설정
            sample_rate_hertz=48000,  # 샘플링 레이트 설정
            language_code="ko-KR",  # 언어 코드 설정
        )
        # 음성 인식 요청
        response = client.recognize(config=config, audio=audio)
        transcript = "".join([result.alternatives[0].transcript for result in response.results])  # 인식 결과 추출

        # 변환된 결과를 DB에 저장
        save_to_db(user_uuid, transcript, filepath)

        # 성공 시 변환된 텍스트 내용과 파일 경로 반환
        return jsonify({'transcript': transcript, 'filepath': filepath}), 200

    # 에러 발생 시 에러 메시지 반환
    except Exception as e:
        print(f"Flask 서버 오류: {e}", flush=True)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ----------------------------[챗봇 FAQ 기능 추가]----------------------------
# from Korpora import Korpora  # pip install 했지만 데이터 로드 불가
import pandas as pd
import requests

# 텍스트(문장) 간의 유사도를 계산하기 위한 라이브러리
from sklearn.feature_extraction.text import TfidfVectorizer  # 문장을 벡터로 변환 
from sklearn.metrics.pairwise import cosine_similarity  # 벡터간의 유사도 계산

# 직접 저장한 CSV 파일 경로
csv_path = "D:\Git\\TICO_TEAM\\python\\data_sets\\ChatbotData.csv"
print("ChatbotData.csv 파일 존재 여부:", os.path.exists(csv_path), flush=True)

# CSV 로드
faq_df = pd.read_csv(csv_path)
faq_df.columns = ['question', 'answer', 'label']  # 컬럼명 지정

# 질문-답변 쌍만 추출
questions = faq_df['question'].tolist()  # tolist() : Python 리스트로 변환하는 함수
answers = faq_df['answer'].tolist()

# TF-IDF 벡터화
vectorizer = TfidfVectorizer()  # TfidfVectorizer : 문장 벡터화 도구
question_vectors = vectorizer.fit_transform(questions) # fit_transform : fit - 전체 단어 학습, transform - 문장을 벡터로 변환

# FAQ 검색 함수
def find_best_answer(user_question):
    print("DEBUG: find_best_answer 호출됨. 질문:", user_question, flush=True)

    user_vec = vectorizer.transform([user_question])  # transform([user_question]) : 여러 문장을 받기 때문에 리스트 형태로 받음
    sim_scores = cosine_similarity(user_vec, question_vectors) # user_vec vs question_vectors 간의 코사인 유사도를 계산
    best_idx = sim_scores.argmax()  # 유사도가 가장 높은 인덱스(질문 번호)를 찾음
    best_score = sim_scores[0, best_idx]  # 유사도 점수를 저장 (0.0 ~ 1.0 사이)

    print(f"DEBUG: best_idx: {best_idx}, best_score: {best_score}", flush=True)

    # 유사도가 0.3 이상일 경우
    if best_score > 0.3:
        answer = faq_df.iloc[best_idx]["answer"]  # faq_df.iloc[best_idx]: best_idx에 해당하는 행
        print("DEBUG: 반환 답변:", answer, flush=True)
        return answer
    
    # 유사도가 낮으면 기본 응답 반환
    else:
        return "죄송합니다. 해당 질문에 대한 적절한 답변을 찾을 수 없습니다."

# chatbot_faq() 함수 안에 추가
@app.route("/chatbot/faq", methods=["POST"])
def chatbot_faq():
    data = request.json
    user_question = data.get("question", "")
    user_uuid = data.get("user_uuid", "")  # React에서 같이 보내주면 받음

    print("- 사용자 질문:", user_question, flush=True)
    print("- 사용자 UUID:", user_uuid, flush=True)

    if not user_question:
        return jsonify({"error": "질문이 비어 있습니다."}), 400

    answer = find_best_answer(user_question)
    print("선택된 답변:", answer, flush=True)

    # Flask → Spring Boot로 응답 저장 요청
    try:
        spring_response = requests.post("http://localhost:8081/api/bot/reply", json={
            "user_uuid": user_uuid,
            "msg": answer,
            "record": "B",
            "sender": "bot"
        })
        print("Spring 응답 상태 코드:", spring_response.status_code, flush=True)
        print("Spring 응답 본문:", spring_response.text, flush=True)

    except Exception as e:
        print("Spring으로 응답 전송 실패:", e, flush=True)

    return jsonify({"answer": answer})

# -----------------------------[앱 실행]-----------------------------
if __name__ == '__main__':
    # 오디오 저장 디렉토리 미리 생성
    audio_dir = "D:\\Git\\TICO_TEAM\\python\\audio_files"
    if not os.path.exists(audio_dir):
        os.makedirs(audio_dir)

    # Flask 앱 실행
    app.run(debug=True, port=5000)
