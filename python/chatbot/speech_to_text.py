from google.cloud import speech_v1  # Google Cloud Speech-to-Text API 클라이언트
import io
import os
from flask import request, jsonify

# py 파일 호출
from db import save_to_db, get_nickname, get_audio_count
from config import AUDIO_FILES_DIR
from datetime import datetime

# ----------------[routes.py 파일에서 POST 요청 시 작동하는 핸들러 함수]----------------
def handle_speech_to_text():
    user_uuid = request.form.get('user_uuid') # user_uuid를 form 데이터로 받음

    # 오디오 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if 'audio' not in request.files or request.files['audio'].filename == '':
        return jsonify({'error': 'No audio file'}), 400

    audio_file = request.files['audio'] # 오디오 파일 가져오기

    # 선택된 파일이 없을 경우, 에러 메시지 반환(400 에러)
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 음성 파일 저장
        nickname = get_nickname(user_uuid) # 사용자 닉네임 
        count = get_audio_count(user_uuid, 'user')  # 오디오 파일 수 
        timestamp = datetime.now().strftime("%Y%m%d")  # 현재 날짜 
        filename = f"{nickname}_user_{timestamp}_{count}.webm"
        filepath = os.path.join(AUDIO_FILES_DIR, filename)
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

    except Exception as e:
        print(f"Flask 서버 오류: {e}", flush=True)
        return jsonify({'error': str(e)}), 500
