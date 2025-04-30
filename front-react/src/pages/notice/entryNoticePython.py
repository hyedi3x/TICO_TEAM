import os
import json
import pymysql
from dotenv import load_dotenv
import re

# 이모지 제거 함수, CHARSET=utf8mb3을 사용하는 rds DB. 이모지는 CHARSET=utf8mb4를 사용해야해서 제거한다.
def remove_emoji(text):
    # re.sub에서 4바이트 범위의 유니코드 문자(이모지 포함) 모두 제거
    return re.sub(r'[\U00010000-\U0010FFFF]', '', text)

# 환경 변수 불러오기
load_dotenv(dotenv_path="D:/Git/TICO_TEAM/.env")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# JSON 파일 로드
with open('./front-react/src/pages/notice/entryNotice2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

notices = data["data"]["discussList"]["list"]

# DB 연결
conn = pymysql.connect(
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    charset='utf8mb3'
)
cursor = conn.cursor()

emp_id = '10004'  # 모든 공지의 사번을 10004로 고정

for notice in notices:
    title = remove_emoji(notice["title"])
    likes_length = notice["likesLength"]
    visit_length = notice["visit"]
    created_at = notice["created"].replace('T', ' ').replace('Z', '')
    # COALESCE로 최대값 + 1 (없으면 1)
    cursor.execute("SELECT COALESCE(MAX(notice_id), 0) + 1 FROM notice_tb")
    next_id = cursor.fetchone()[0] # 첫줄만 반환

    sql = """
    INSERT INTO notice_tb (notice_id, title, emp_id, likes_length, visit_length, created_at)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (next_id, title, emp_id, likes_length, visit_length, created_at))

conn.commit()
cursor.close()
conn.close()
