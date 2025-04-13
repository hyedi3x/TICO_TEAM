import json
import pymysql  # pip install pymysql
from dotenv import load_dotenv  # pip install python-dotenv
import os

# .env 파일 로드
load_dotenv()

# 환경 변수에서 DB 설정 불러오기
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))  # 기본값 3306
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")


def insert_qa_into_mariadb_from_file(json_file_path, limit=20):
    """JSON 파일에서 질문-답변을 최대 limit개까지 읽어 MariaDB에 삽입"""
    try:
        # PyMySQL로 DB 연결
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4'  # 한글 인코딩 대응
        )
        cursor = conn.cursor()

        count = 0
        with open(json_file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            for item in data["questions"]:
                if count >= limit:
                    break

                question = item["question"]
                answer = item["answer"]

                # ON DUPLICATE KEY UPDATE 사용 (question은 UNIQUE로 설정되어 있어야 함)
                cursor.execute(
                    """
                    INSERT INTO faq_tb (question, answer)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE answer = %s
                    """,
                    (question, answer, answer)
                )
                count += 1

        conn.commit()
        print(f"✓ {count}개의 질문-답변이 성공적으로 MariaDB에 삽입되었습니다.")

    except pymysql.MySQLError as e:
        print(f"※ MariaDB 오류 발생: {e}")
    except FileNotFoundError:
        print(f"※ 파일을 찾을 수 없습니다: {json_file_path}")
    except json.JSONDecodeError:
        print(f"※ JSON 형식이 잘못되었습니다: {json_file_path}")
    finally:
        if conn:
            cursor.close()
            conn.close()
            print("✓ MariaDB 연결 종료")

# json 파일 경로 설정
json_file_path = "./src/faq/Ecommerce_FAQ_Chatbot_dataset.json"
insert_qa_into_mariadb_from_file(json_file_path, limit=20)