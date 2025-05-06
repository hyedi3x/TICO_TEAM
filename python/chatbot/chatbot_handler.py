# chatbot_handler.py
from flask import request, jsonify # Flask에서 HTTP 요청 처리 및 JSON 응답 생성을 위한 모듈

# FAQ 기반 질문에 가장 적절한 답변을 찾아주는 함수
from chatbot_faq import find_best_answer

# 코드 및 툴팁 관련 질문을 판별하고 응답을 생성하는 함수들
from chatbot_response import (
    is_code_question,           # 사용자의 질문이 블록 코드 관련인지 판별
    is_tooltip_question,        # 사용자의 질문이 블록 툴팁 관련인지 판별
    get_code_block_answer,      # 블록 코드 관련 질문에 대한 답변 생성
    get_block_tooltip_answer    # 블록 툴팁 관련 질문에 대한 답변 생성
)

# MariaDB에 연결하고, 챗봇 응답을 로그로 저장하기 위한 함수
from db import connect_to_maria, save_to_db

# 텍스트를 음성으로 변환하여 TTS 오디오 파일을 생성하는 함수
from text_to_speech import text_to_speech

# 경로 및 파일 이름 처리를 위한 표준 라이브러리
import os

# 텍스트를 음성으로 변환하고 필요한 경우 응답에 포함하여 반환하는 함수
def respond_with_tts_if_needed(user_uuid, answer):
    conn = connect_to_maria()  # MariaDB 연결
    if not conn:
        return jsonify({'response': answer})  # 연결 실패 시 TTS 없이 응답

    try:
        with conn.cursor() as cursor:
            # 해당 사용자의 최근 record 설정 확인 (음성 응답 여부)
            cursor.execute(
                "SELECT record FROM chat_log WHERE user_uuid = %s ORDER BY date_time DESC LIMIT 1",
                (user_uuid,)
            )
            record = cursor.fetchone()

            if record and record[0] == 'Y':
                # 음성 응답이 활성화된 경우
                tts_filepath = text_to_speech(answer, user_uuid)  # TTS 파일 생성
                save_to_db(user_uuid, answer, tts_filepath, sender='bot', record='Y')  # 로그 저장
                return jsonify({
                    'response': answer,
                    'tts_filepath': f"/audio/{os.path.basename(tts_filepath)}"  # 오디오 파일 경로 포함 응답
                })
            else:
                # 음성 응답 비활성화일 경우 텍스트만 저장 및 응답
                save_to_db(user_uuid, answer, None, sender='bot', record='N')
                return jsonify({'response': answer})
    finally:
        conn.close()  # DB 연결 종료

# 챗봇 메인 진입점: 사용자 질문을 받아 적절한 답변 생성 후 반환
def handle_chatbot():
    data = request.get_json()
    user_question = data.get('question', '')  # 사용자 질문 추출
    user_uuid = data.get('user_uuid', '')  # 사용자 UUID 추출

    if not user_question:
        return jsonify({'error': "질문이 비어 있습니다."}), 400  # 질문 없으면 에러 응답

    print("- 사용자 질문:", user_question, flush=True)
    print("- 사용자 UUID:", user_uuid, flush=True)

    # 사용자 질문 유형에 따라 적절한 처리 분기
    if is_code_question(user_question):
        answer = get_code_block_answer(user_question)  # 코드 블록 관련 질문
    elif is_tooltip_question(user_question):
        answer = get_block_tooltip_answer(user_question)  # 툴팁 관련 질문
    else:
        answer = find_best_answer(user_question)  # FAQ 또는 일반 질문

    # 응답 생성 및 TTS 필요 시 포함
    return respond_with_tts_if_needed(user_uuid, answer)
