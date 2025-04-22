import pandas as pd
import pymysql
import os
from dotenv import load_dotenv  # env 파일 로드를 위해서

# .env 파일 로드
load_dotenv()

# ----------------------[MariaDB 연결 정보 (env 파일에서 로드)]--------------------
MARIA_HOST = os.getenv('DB_HOST')
MARIA_PORT = int(os.getenv('DB_PORT'))
MARIA_USER = os.getenv('DB_USER')
MARIA_PASSWORD = os.getenv('DB_PASSWORD')
MARIA_DB = os.getenv('DB_NAME')

# ----------------[MariaDB에 연결하고 연결 객체를 반환하는 함수]----------------
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

# -------------------------[상대 경로 설정]--------------------------
base_dir = os.path.dirname(os.path.abspath(__file__))  # 현재 py 파일 위치
csv_path = os.path.join(base_dir, '..', 'data_sets', '한국문화정보원_공공저작물_통합게시판_FAQ_12_25_2017.csv')  # ../data_sets/ChatbotData.csv

# 데이터 전처리 함수
def preprocess_data(csv_path):
    # CSV 로드
    faq_df = pd.read_csv(csv_path)
    
    # 필요한 열만 남기기
    faq_df = faq_df[['데이터코드', '게시판명', '본문', '조회수', '시작일', '종료일', '기관코드', '기관코드명']]
    
    # 컬럼명 변경
    faq_df.columns = ['data_code', 'board_name', 'content', 'view_count', 'start_date', 'end_date', 'organization_code', 'organization_name']
    
    # 게시판명에 '공공누리' 또는 '공공기관'이 포함된 데이터는 필터링
    faq_df = faq_df[~faq_df['board_name'].str.contains('공공누리|공공기관|공공|저작물', na=False)]
    
    return faq_df

# DB에 저장하는 함수
def save_faq_to_db(faq_df):
    conn = connect_to_maria()
    if conn:
        try:
            with conn.cursor() as cursor:
                # FAQ 데이터를 DB에 삽입하는 SQL문
                sql = """
                    INSERT INTO faq_table (data_code, board_name, content, view_count, start_date, end_date, organization_code, organization_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                for _, row in faq_df.iterrows():
                    cursor.execute(sql, (row['data_code'], row['board_name'], row['content'], row['view_count'], row['start_date'], row['end_date'], row['organization_code'], row['organization_name']))
                conn.commit()
                print("데이터베이스에 저장 성공")
        except Exception as e:
            print(f"DB 저장 실패: {e}")
        finally:
            conn.close()

# -----------------------------[메인 처리 함수]-----------------------------
def main():
    filtered_data = preprocess_data(csv_path)  # CSV 전처리
    save_faq_to_db(filtered_data)  # DB 저장

# -----------------------------[파이썬 실행 시 호출 함수 main()]-----------------------------
if __name__ == "__main__":
    main()
