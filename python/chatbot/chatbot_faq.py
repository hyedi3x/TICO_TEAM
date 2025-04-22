# ----------------------------[챗봇 FAQ 기능 처리 파일]----------------------------
from flask import request, jsonify                     # Flask 요청/응답 모듈
import pandas as pd
import re                                              # 정규 표현식
from sklearn.feature_extraction.text import TfidfVectorizer  # TF-IDF 벡터화
from sklearn.metrics.pairwise import cosine_similarity       # 코사인 유사도
import os

# py 파일 호출
from db import save_to_db, connect_to_maria            # DB 저장 및 연결 함수
from text_to_speech import text_to_speech              # 텍스트 → 음성 변환 함수 (Google Cloud TTS)

# ----------------[MariaDB에서 FAQ 데이터를 불러오는 함수]----------------
def get_faq_from_db():
    conn = connect_to_maria()
    if conn:
        try:
            # FAQ 데이터를 DB에서 조회하는 SQL문
            with conn.cursor() as cursor:
                sql = "SELECT board_name, content FROM faq_table"
                cursor.execute(sql)
                rows = cursor.fetchall() # fetchall() : 파이썬에서 데이터베이스 쿼리 결과를 전체 가져오는 함수
                return pd.DataFrame(rows, columns=["question", "answer"])  # board_name -> question, content -> answer로 데이터프레임 형식으로 변환
        finally:
            conn.close()
    return None

# ---------------------------[FAQ 검색 함수]---------------------------
# 사용자의 질문과 가장 유사한 FAQ 항목을 찾아 HTML 줄바꿈 처리로 반환
def find_best_answer(user_question): # DB에서 FAQ 데이터 호출, FAQ.py 전처리된 데이터
    faq_df = get_faq_from_db()
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

            # 문장을 정규식으로 잘라 문장 단위로 <br><br> 붙여 포맷팅
            sentence_list = re.findall(
                r'\d+\.\s*[^0-9.]+(?:[,]\s*)?'  # 번호 항목
                r'|[^0-9].*?(?:요|니다|까|세요|십시오|죠|나요|했나|가요|라요|래요|에요|예요|어요|드려요|줘요|할게요|싶어요|같아요|있어|었어)[.?!]?',
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

# ------------------[FAQ 요청 처리 라우터 - /chatbot/faq]------------------
# React에서 질문과 user_uuid를 JSON으로 POST 요청하면 이 함수가 실행됨
def handle_chatbot_faq():
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
                # 사용자의 가장 최근 record 타입 조회 (음성/텍스트 판단용)
                sql = "SELECT record FROM chat_log WHERE user_uuid = %s ORDER BY date_time DESC LIMIT 1"
                cursor.execute(sql, (user_uuid,))
                record = cursor.fetchone()

                # 질문 → 답변 탐색
                answer = find_best_answer(user_question)

                # 마지막 메시지가 음성이라면(Y) TTS 수행
                if record and record[0] == 'Y':
                    tts_filepath = text_to_speech(answer, user_uuid) # TTS 변환 함수 호출
                    save_to_db(user_uuid, answer, tts_filepath, sender='bot', record='Y')
                    return jsonify({"answer": answer, "tts_filepath": f"/audio/{os.path.basename(tts_filepath)}"})
                else:
                    # 'N' 또는 다른 값일 경우 텍스트로만 응답
                    save_to_db(user_uuid, answer, None, sender='bot', record='N')
                    return jsonify({"answer": answer})
        finally:
            conn.close()

    # DB 연결 실패 시에도 답변만 전달 (DB 저장은 생략)
    answer = find_best_answer(user_question)
    return jsonify({"answer": answer})
