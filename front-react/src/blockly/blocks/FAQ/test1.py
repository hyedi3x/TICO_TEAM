import json
import mysql.connector

def insert_qa_into_mariadb_from_file(json_file_path, db_config, limit=20): # 20개 저장
    """JSON 파일에서 질문-답변 묶음을 최대 limit개까지 읽어 MariaDB 데이터베이스에 삽입합니다."""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # 현재 최대 qa_id 조회
        cursor.execute("SELECT MAX(qa_id) FROM qa")
        max_qa_id = cursor.fetchone()[0] or 0  # 테이블이 비어있으면 0으로 초기화

        count = 0
        with open(json_file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            for item in data["questions"]:
                if count >= limit:
                    break

                # max_qa_id += 1  # qa_id 1 증가
                question = item["question"]
                answer = item["answer"]
                cursor.execute("INSERT INTO qa (qa_id, question, answer) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE answer = %s", (max_qa_id, question, answer, answer))
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

# MariaDB 연결 설정
db_config = {
    "host": "localhost",
    "user": "kim",
    "password": "1234",
    "database": "mydb",
}

# JSON 파일 경로
json_file_path = "./front-react/src/blockly/blocks/FAQ/Ecommerce_FAQ_Chatbot_dataset.json"  # 실제 JSON 파일 경로로 변경하세요.

# 데이터 삽입 함수 호출 (limit=20으로 설정)
insert_qa_into_mariadb_from_file(json_file_path, db_config, limit=20)