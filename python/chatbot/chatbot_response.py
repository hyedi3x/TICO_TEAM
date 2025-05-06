# chatbot_response.py
# 텍스트 벡터화 및 유사도 계산을 위한 사이킷런 모듈
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# DB 연결 함수
from db import connect_to_maria

# 코드 관련 질문 여부 판단 함수
def is_code_question(question):
    # 질문 내용에 코드 관련 키워드가 포함되어 있는지 확인
    keywords = ['코드', 'javascript', 'js', '작동 원리', '어떻게 동작']
    return any(keyword in question.lower() for keyword in keywords)

# 툴팁(설명) 관련 질문 여부 판단 함수
def is_tooltip_question(question):
    # 질문 내용에 설명 관련 키워드가 포함되어 있는지 확인
    keywords = ['의미', '무슨 뜻', '설명']
    return any(keyword in question.lower() for keyword in keywords)

# DB에서 모든 블록 정보 조회
def get_all_block_info():
    conn = connect_to_maria()
    if conn:
        try:
            with conn.cursor() as cursor:
                # block_info_tb 테이블에서 블록 관련 데이터 조회
                sql = "SELECT block_type, message0, tooltip, generator_code FROM block_info_tb"
                cursor.execute(sql)
                rows = cursor.fetchall()

                # 결과를 딕셔너리 리스트로 가공하여 반환
                return [
                    {
                        'block_type': row[0],
                        'message': row[1],
                        'tooltip': row[2],
                        'generator_code': row[3]
                    } for row in rows
                ]
        except Exception as e:
            print(f"[DB 오류] 블록 정보 불러오기 실패: {e}", flush=True)
        finally:
            conn.close()
    return []  # 실패 시 빈 리스트 반환

# 사용자 질문과 가장 유사한 블록을 찾는 함수
def find_most_similar_block(user_question, block_data):
    # 각 블록의 대표 메시지를 기준으로 TF-IDF 벡터 생성
    messages = [block['message'] for block in block_data]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(messages + [user_question])  # 질문도 함께 벡터화

    # 질문 벡터와 기존 메시지 벡터 간의 코사인 유사도 계산
    cosine_sim = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    most_similar_index = cosine_sim.argmax()  # 유사도가 가장 높은 인덱스 추출

    return block_data[most_similar_index]  # 해당 블록 정보 반환

# 코드 블록 질문에 대한 답변 생성
def get_code_block_answer(user_question):
    block_data = get_all_block_info()
    if not block_data:
        return "블록 정보를 불러오지 못했습니다."

    # 사용자 질문과 가장 유사한 블록을 block_data에서 찾음 (TF-IDF + 코사인 유사도 기반)
    best_match = find_most_similar_block(user_question, block_data)

    # 해당 블록의 코드 생성기(generator_code) 추출 (없을 경우 빈 문자열 대체)
    raw_code = best_match['generator_code'] or ''

    # "function(block)" 이후 코드만 추출
    func_start = raw_code.find("function(block)")
    func_code = raw_code[func_start:] if func_start != -1 else raw_code

    # 주석 제거: 각 줄에서 "//" 이후를 제거
    func_code = "\n".join([
        line.split("//")[0].rstrip() for line in func_code.splitlines()
    ])

    if func_code.strip():
        # 코드가 있다면 반환
        return f"[{best_match['block_type']}] 블록의 작동 코드는 다음과 같습니다:<br><br>{func_code}"
    else:
        # 코드가 없다면 안내 메시지
        return f"{best_match['block_type']} 블록은 코드 생성 정보가 등록되지 않았습니다."

# 툴팁(설명) 질문에 대한 답변 생성
def get_block_tooltip_answer(user_question):
    block_data = get_all_block_info()
    if not block_data:
        return "블록 정보를 불러오지 못했습니다."

    best_match = find_most_similar_block(user_question, block_data)
    tooltip = best_match['tooltip'] or ''

    if tooltip.strip():
        # 설명이 있다면 반환
        return f"[{best_match['block_type']}] 블록 설명:<br><br>{tooltip}"
    else:
        # 설명이 없다면 안내 메시지
        return f"{best_match['block_type']} 블록은 설명이 등록되지 않았습니다."
