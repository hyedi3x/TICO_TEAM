# ----------------------------[챗봇 음성 텍스트 변환 코드]----------------------------
# flask : 웹 애플리케이션 프레임 워크, send_from_directory : 음성 파일을 제공
from flask import Flask, request, jsonify, send_from_directory  
from flask_cors import CORS  # flask cors 라이브러리 추가
from google.cloud import speech_v1  # Google Cloud Speech-to-Text API 클라이언트
import io  # 파일 입출력
import sys
import os  # 운영체제
import uuid  # 고유 ID 생성
import pymysql  # MariaDB 연결 라이브러리
from dotenv import load_dotenv  # env 파일 로드를 위해서
import traceback  # traceback 모듈 추가
from datetime import datetime, timedelta  # 시간대 설정용

app = Flask(__name__)  # 파이썬 flask 서버 생성 (flask application name) : app
CORS(app, resources={r"/*": {"origins": "*"}})  # CORS 설정 추가, localhost:3000번 포트의 모든 origins 허용

# .env 파일 로드
load_dotenv()

# python 표준 출력 스트림(sys.stdout)의 인코딩을 UTF-8로 변경
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# -------------------------[경로 설정]--------------------------
base_dir = os.path.dirname(os.path.abspath(__file__))
audio_files = os.path.join(base_dir, 'static', 'audio_files')

# 폴더가 없으면 자동으로 생성 (중첩 폴더 포함)
try:
    os.makedirs(audio_files, exist_ok=True)
    print(f"음성 파일 저장 경로 확인 완료: {audio_files}", flush=True)
except Exception as e:
    print(f"오디오 폴더 생성 실패: {e}", flush=True)

# 음성 파일 제공 엔드포인트
@app.route("/audio/<filename>")
def get_audio_file(filename):
    try:
        return send_from_directory(audio_files, filename)
    except Exception as e:
        print(f"파일 제공 오류: {e}")
        return jsonify({"error": "파일을 찾을 수 없습니다."}), 404

# ----------------------[MariaDB 연결 정보 (env 파일에서 로드)]--------------------
MARIA_HOST = os.getenv('DB_HOST')
MARIA_PORT = int(os.getenv('DB_PORT'))
MARIA_USER = os.getenv('DB_USER')
MARIA_PASSWORD = os.getenv('DB_PASSWORD')
MARIA_DB = os.getenv('DB_NAME')

# ----------------[MariaDB에 연결하고 연결 객체를 반환하는 함수]----------------
def connect_to_maria():
    try:
        conn = pymysql.connect(
            host=MARIA_HOST,
            port=MARIA_PORT,
            user=MARIA_USER,
            password=MARIA_PASSWORD,
            db=MARIA_DB,
            charset='utf8'  # UTF8 인코딩 사용
        )
        print("MariaDB 연결 성공", flush=True)   # flush=True : 출력 결과를 즉시 콘솔(또는 로그)에 강제로 내보내는 옵션
        return conn
    except Exception as e:
        print(f"MariaDB 연결 실패: {e}", flush=True)
        return None

# ----------------[음성 텍스트 변환 결과와 파일 경로를 MariaDB에 저장하는 함수]----------------
def save_to_db(user_uuid, transcript, filepath=None, sender='user', record='Y'):
    conn = connect_to_maria()
    if conn:
        try:
            # 커서 생성, 데이터베이스에서 데이터를 검색하거나 수정할 때, 커서는 결과 집합을 순차적으로 처리
            with conn.cursor() as cursor:
                kor_time = datetime.utcnow() + timedelta(hours=9)  # 한국 시간으로 변환

                # insert 구문 : user_uuid, 메시지, 음성파일 경로, 음성/텍스트 여부, user/bot 여부
                sql = """
                    INSERT INTO chat_log (user_uuid, msg, file_path, record, sender, date_time)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                #  execute : Python에서 SQL 쿼리를 실행, 파라미터 값 바인딩(값을 안전하게 끼워넣음)
                cursor.execute(sql, (user_uuid, transcript, filepath, record, sender, kor_time))
            conn.commit()  # 변경사항 auto commit
            print("MariaDB 저장 성공", flush=True)
        except Exception as e:
            print(f"MariaDB 저장 실패: {e}", flush=True)
            traceback.print_exc()  # print_exc() : 예외 발생 시 traceback 출력
        finally:
            try:
                conn.close()  # 항상 connection close
            except Exception as close_error:
                print(f"연결 종료 실패: {close_error}", flush=True)
    
# ----------------[POST request speech file을 text로 변환하고 DB에 저장]----------------
# jsonify : Flask에서 제공하는 함수, 파이썬 딕셔너리/리스트 데이터를 JSON 형식의 응답으로 변환
# 웹 API는 일반적으로 데이터를 JSON 형식으로 클라이언트에게 전송
@app.route('/speech_to_text', methods=['POST'])
def speech_to_text():

    user_uuid = request.form.get('user_uuid')  # user_uuid를 form 데이터로 받음

    # 오디오 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if 'audio' not in request.files or request.files['audio'].filename == '':
        return jsonify({'error': 'No audio file'}), 400

    audio_file = request.files['audio']  # 오디오 파일 가져오기

    # 선택된 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 음성 파일 저장
        filename = str(uuid.uuid4()) + ".webm"
        filepath = os.path.join(audio_files, filename)
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

        # result.alternatives[0].transcript : 음성 인식 결과에서 텍스트(문자)를 추출
        # alternatives: 결과에 대한 여러 후보군 존재
        # [0] : 가장 확실한(가장 높은 confidence를 가진) 첫 번째 결과
        # ..transcript: 결과의 문장(텍스트)을 반환
        transcript = "".join([result.alternatives[0].transcript for result in response.results])  
        
        # 성공 시 변환된 텍스트 내용과 파일 경로 반환
        return jsonify({'transcript': transcript, 'filepath': filepath}), 200

    # 에러 발생 시 에러 메시지 반환
    except Exception as e:
        print(f"Flask 서버 오류: {e}", flush=True)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ----------------------------[TTS 호출 코드]----------------------------
from google.cloud import texttospeech  # Google Cloud TTS API 클라이언트

# 텍스트를 음성으로 변환하고, 음성 파일(MP3)을 저장하는 함수
def text_to_speech(text, user_uuid):
    # 화면 출력용 줄바꿈 태그 <br><br>는 음성 출력에 불필요하므로 공백으로 대체
    clean_text = text.replace("<br><br>", " ")

    # Google Cloud TTS 클라이언트 객체 생성
    client = texttospeech.TextToSpeechClient()

    # 변환할 텍스트 지정 (SynthesisInput 객체로 감쌈)
    input_text = texttospeech.SynthesisInput(text=clean_text)

    # 사용할 음성 설정
    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR",  # 사용할 언어는 한국어
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL  # 성별은 중립 (male/female도 선택 가능)
    )

    # 오디오 출력 설정
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3  # 출력 포맷은 MP3 (기본은 LINEAR16)
    )

    # 실제 TTS 변환 요청을 서버로 보냄 → 음성 데이터가 포함된 응답 객체 반환
    response = client.synthesize_speech(
        input=input_text, voice=voice, audio_config=audio_config
    )

    # 음성 파일명을 사용자의 UUID 기반으로 생성
    tts_filename = f"{user_uuid}_response.mp3"
    
    # 음성 파일 저장 경로 설정 (미리 정의된 audio_files 경로 사용)
    tts_filepath = os.path.join(audio_files, tts_filename)

    # MP3 음성 데이터를 파일로 저장
    with open(tts_filepath, "wb") as out:
        out.write(response.audio_content)
        print(f"TTS 음성 파일 저장: {tts_filepath}")  # 저장된 위치를 로그로 출력

    # 저장된 파일 경로를 리턴 → 클라이언트가 재생하거나 접근할 수 있도록 함
    return tts_filepath

# ----------------------------[챗봇 FAQ 기능 추가]----------------------------
import pandas as pd
import re   # 정규식 사용 라이브러리

# 텍스트(문장) 간의 유사도를 계산하기 위한 라이브러리
from sklearn.feature_extraction.text import TfidfVectorizer  # 문장을 벡터로 변환 
from sklearn.metrics.pairwise import cosine_similarity  # 벡터간의 유사도 계산

# ----------------[MariaDB에서 FAQ 데이터를 불러오는 함수]----------------
def get_faq_from_db():
    conn = connect_to_maria()
    if conn:
        try:
            with conn.cursor() as cursor:
                # FAQ 데이터를 DB에서 조회하는 SQL문
                sql = """
                    SELECT board_name, content FROM faq_table
                """
                cursor.execute(sql)
                rows = cursor.fetchall()  # fetchall() : 파이썬에서 데이터베이스 쿼리 결과를 전체 가져오는 함수
                return pd.DataFrame(rows, columns=["question", "answer"]) # board_name -> question, content -> answer로 데이터프레임 형식으로 변환
        except Exception as e:
            print(f"MariaDB 데이터 조회 실패: {e}", flush=True)
            traceback.print_exc()  # 예외 발생 시 traceback 출력
        finally:
            try:
                conn.close()  # 항상 connection close
            except Exception as close_error:
                print(f"연결 종료 실패: {close_error}", flush=True)
    return None

# ---------------------------[FAQ 검색 함수]------------------------
def find_best_answer(user_question):
    faq_df = get_faq_from_db() # DB에서 FAQ 데이터 호출, FAQ.py 전처리된 데이터
    if faq_df is not None: 
        vectorizer = TfidfVectorizer() # 질문(문장)을 벡터로 변환하기 위한 TF-IDF 벡터라이저 사용
        question_vectors = vectorizer.fit_transform(faq_df['question'].tolist())  # 학습용 질문들

        # 사용자의 질문도 벡터로 변환
        user_vec = vectorizer.transform([user_question])

        # 코사인 유사도 계산
        sim_scores = cosine_similarity(user_vec, question_vectors)
        best_idx = sim_scores.argmax()  # 가장 유사한 질문의 인덱스
        best_score = sim_scores[0, best_idx]  # 해당 질문의 유사도 점수

        if best_score > 0.3:  # 0.3 이상일 때만 유사하다고 판단
            answer = faq_df.iloc[best_idx]["answer"]  # 가장 유사한 질문에 대한 답변 추출

            # 문장 단위로 자르기 위한 정규표현식
            # 예: '1. 항목입니다.', '안내해드려요.', '확인 부탁드려요.' 등으로 분리
            sentence_list = re.findall(
                r'\d+\.\s*[^0-9.]+(?:[,]\s*)?'      # 1. 항목 설명부분 (숫자로 시작하는 항목)
                r'|[^0-9].*?(?:요|니다|까|세요|십시오|죠|나요|했나|가요|라요|래요|에요|예요|어요|드려요|줘요|할게요|싶어요|같아요|있어|었어)[.?!]?',  # 일반 문장 종결형 (~요, ~니다 등으로 끝남)
                answer
            )

            result = []           # 최종 줄바꿈 처리된 문장 목록
            numbered_items = []   # 숫자 항목(1., 2., 3.)을 모아 두는 리스트
            first = True          # 첫 문장 여부 확인 (맨 앞은 <br><br> 없이 붙임)

            for s in sentence_list:
                s = s.strip()  # strip : 양쪽 끝 공백을 제거하는 함수
                if not s:
                    continue  # 빈 문자열은 건너뜀

                # 숫자로 시작하는 항목이면 별도로 모아두기
                if re.match(r'^\d+\.', s):
                    numbered_items.append(s)

                else:
                    # 숫자 항목이 누적되어 있으면 먼저 처리해서 붙이기
                    if numbered_items:
                        joined = " ".join(numbered_items)  # 1. ~ 2. ~ 를 한 줄로 붙임
                        result.append(joined if first else "<br><br>" + joined)
                        numbered_items = []  # 초기화
                        first = False

                    # 현재 문장 추가
                    result.append(s if first else "<br><br>" + s)
                    first = False

            # 마지막에 숫자 항목만 남아있다면 추가
            if numbered_items:
                joined = " ".join(numbered_items)
                result.append(joined if first else "<br><br>" + joined)

            # 최종 결과 문자열을 합쳐서 반환
            return "".join(result).strip()

    # FAQ 데이터가 없거나 유사한 질문을 못 찾은 경우
    return "죄송합니다. 해당 질문에 대한 적절한 답변을 찾을 수 없습니다."

# ---------------------------[스프링 부트와 faq 데이터 송수신 및 TTS 추가]------------------------
@app.route("/chatbot/faq", methods=["POST"])
def chatbot_faq():
    data = request.json    # 클라이언트가 보낸 JSON 형식의 요청 데이터를 받아, 딕셔너리 형태로 반환
    user_question = data.get("question", "")
    user_uuid = data.get("user_uuid", "")  # React에서 같이 보내주면 받음

    print("- 사용자 질문:", user_question, flush=True)
    print("- 사용자 UUID:", user_uuid, flush=True)

    if not user_question:
        return jsonify({"error": "질문이 비어 있습니다."}), 400

    # DB에서 해당 사용자의 마지막 기록을 확인 (record 값이 'Y'이면 음성 응답)
    conn = connect_to_maria()
    if conn:
        try:
            with conn.cursor() as cursor:
                # DB에서 마지막 기록을 확인하는 쿼리
                sql = "SELECT record FROM chat_log WHERE user_uuid = %s ORDER BY date_time DESC LIMIT 1"
                cursor.execute(sql, (user_uuid,))
                record = cursor.fetchone()

                answer = find_best_answer(user_question)
                
                # 만약 'Y'라면 음성으로 처리, 'N'이라면 텍스트로 처리
                if record and record[0] == 'Y':
                    tts_filepath = text_to_speech(answer, user_uuid)  # TTS 변환 함수 호출
                    save_to_db(user_uuid, answer, tts_filepath, sender='bot', record='Y')
                    return jsonify({"answer": answer, "tts_filepath": f"/audio/{os.path.basename(tts_filepath)}"})

                else:
                    # 'N' 또는 다른 값일 경우 텍스트로만 응답
                    save_to_db(user_uuid, answer, None, sender='bot', record='N')
                    return jsonify({"answer": answer})

        except Exception as e:
            print(f"DB 조회 오류: {e}", flush=True)
            return jsonify({"error": "DB 조회 오류"}), 500
        finally:
            conn.close()

    # DB 조회 실패했을 경우에도 응답 저장은 하지 않음 (이미 질문은 저장됨)
    return jsonify({"answer": answer})

# -----------------------------[앱 실행]-----------------------------
if __name__ == '__main__':

    # Flask 앱 실행
    app.run(debug=True, port=5000)  