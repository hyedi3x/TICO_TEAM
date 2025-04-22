
import pymysql # MariaDB 연결 라이브러리

# py 파일 호출 (db 정보 호출)
from config import MARIA_HOST, MARIA_PORT, MARIA_USER, MARIA_PASSWORD, MARIA_DB

# ----------------[MariaDB에 연결하고 연결 객체를 반환하는 함수]----------------
def connect_to_maria():
    try:
        return pymysql.connect(
            host=MARIA_HOST,
            port=MARIA_PORT,
            user=MARIA_USER,
            password=MARIA_PASSWORD,
            db=MARIA_DB,
            charset='utf8' # UTF8 인코딩 사용
        )
    except Exception as e:
        print(f"MariaDB 연결 실패: {e}", flush=True)
        return None

# -------------------[음성 파일명 설정]-------------------
# 사용자 닉네임을 데이터베이스에서 조회
def get_nickname(user_uuid):
    conn = connect_to_maria()
    if conn:
        try:
            with conn.cursor() as cursor:
                # UUID에 해당하는 사용자의 닉네임을 users 테이블에서 조회
                cursor.execute("SELECT nickname FROM users WHERE user_uuid = %s", (user_uuid,))
                result = cursor.fetchone()  # 튜플 형태로 반환, 결과 중 첫 번째 행만 반환 
                return result[0] if result else "unknown"
        finally:
            conn.close()
    return "unknown" # 결과가 있으면 닉네임 반환, 없으면 "unknown" 반환

# 특정 사용자의 음성 메시지 수를 세는 함수 
def get_audio_count(user_uuid, sender):
    conn = connect_to_maria()
    if conn:
        try:
            with conn.cursor() as cursor:
                # where 조건절에 해당하는 전체 레코드 수 조회 
                cursor.execute("SELECT COUNT(*) FROM chat_log WHERE user_uuid = %s AND sender = %s AND record = 'Y'", (user_uuid, sender))
                count = cursor.fetchone()[0]
                return count + 1  # 파일명을 생성 시 1씩 증가
        finally:
            conn.close()
    return 1 # DB 연결 실패 시 기본값으로 1 반환 

# ----------------[음성 텍스트 변환 결과와 파일 경로를 MariaDB에 저장하는 함수]----------------
def save_to_db(user_uuid, transcript, filepath=None, sender='user', record='Y'):
    conn = connect_to_maria()
    if conn:
        try:
            # 커서 생성, 데이터베이스에서 데이터를 검색하거나 수정할 때, 커서는 결과 집합을 순차적으로 처리
            with conn.cursor() as cursor:
                from datetime import datetime, timedelta
                kor_time = datetime.utcnow() + timedelta(hours=9) # 한국 시간으로 변환
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
        finally:
            conn.close()  # 항상 connection close