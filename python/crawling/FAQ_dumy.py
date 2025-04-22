import pandas as pd
import pymysql
import os
from dotenv import load_dotenv
from pathlib import Path   # 파일 시스템 경로(path)를 다룰 때 더 객체지향적이고 직관적인 방식을 제공

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
            charset='utf8'
        )
        print("MariaDB 연결 성공", flush=True)
        return connection
    except Exception as e:
        print(f"MariaDB 연결 실패: {e}", flush=True)
        return None

# -------------------------[엑셀 경로 설정 및 로딩]--------------------------
# 루트 경로
ROOT_DIR = Path(__file__).resolve().parents[2]  # 현재 폴더 위치(D:\Git\TICO_TEAM\python\crawling)에서 두 단계 올라감

# xlsx 경로를 루트 기준으로 설정
xlsx_path = ROOT_DIR / 'python' / 'data_sets' / 'faq_dataset_dumy.xlsx'
print(f"불러올 엑셀 경로: {xlsx_path}")

# -------------------------[엑셀 파일 불러오기]--------------------------
def load_excel_data(path):
    df = pd.read_excel(path)
    print(f"엑셀 로딩 성공 - 총 {len(df)}개")
    return df

# -------------------------[DB에 저장 함수]--------------------------
def save_faq_to_db(faq_df):
    conn = connect_to_maria()
    if conn:
        try:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO faq_table (data_code, board_name, content, view_count, start_date, end_date, organization_code, organization_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                for _, row in faq_df.iterrows():
                    cursor.execute(sql, (
                        row['data_code'],
                        row['board_name'],
                        row['content'],
                        row['view_count'],
                        row['start_date'],
                        row['end_date'],
                        row['organization_code'],
                        row['organization_name']
                    ))
                conn.commit()
                print("DB 저장 완료")
        except Exception as e:
            print(f"DB 저장 실패: {e}")
        finally:
            conn.close()

# -----------------------------[메인 실행 함수]-----------------------------
def main():
    faq_df = load_excel_data(xlsx_path)
    save_faq_to_db(faq_df)

# -----------------------------[실행]-----------------------------
if __name__ == "__main__":
    main()
