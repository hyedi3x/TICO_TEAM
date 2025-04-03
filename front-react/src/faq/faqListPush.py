import json
import mysql.connector  # pip install mysql-connector-python

def insert_qa_into_mariadb_from_file(json_file_path, db_config, limit=20):
    """JSON 파일에서 질문-답변 묶음을 최대 limit개까지 읽어 MariaDB 데이터베이스에 삽입합니다."""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        count = 0
        with open(json_file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            for item in data["questions"]:
                if count >= limit:
                    break

                question = item["question"]
                answer = item["answer"]

                # ON DUPLICATE KEY UPDATE 는 question이 UNIQUE여야 동작
                cursor.execute(
                    "INSERT INTO faq_tb (question, answer) VALUES (%s, %s) "
                    "ON DUPLICATE KEY UPDATE answer = %s",
                    (question, answer, answer)
                )
                count += 1

        conn.commit()
        print(f"{count}개의 질문-답변이 MariaDB에 성공적으로 삽입되었습니다.")

    except mysql.connector.Error as e:
        print(f"오류 발생: {e}")
    except FileNotFoundError:
        print(f"오류: 파일을 찾을 수 없습니다: {json_file_path}")
    except json.JSONDecodeError:
        print(f"오류: 잘못된 JSON 형식입니다: {json_file_path}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# MariaDB 연결 설정, 여기 수정할 것
db_config = {
    "host": "호스트번호",
    "user": "유저",
    "password": "비밀번호",
    "database": "db명",
}

# JSON 파일 경로
json_file_path = "./src/faq/Ecommerce_FAQ_Chatbot_dataset.json"

# 함수 호출
insert_qa_into_mariadb_from_file(json_file_path, db_config, limit=20)
