import os
import json
import pymysql
from dotenv import load_dotenv
import re

# 이모지 제거 함수
def remove_emoji(text):
    return re.sub(r'[\U00010000-\U0010FFFF]', '', text)

# .env 환경변수 불러오기
load_dotenv(dotenv_path="D:/Git/TICO_TEAM/.env")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

# JSON 파일명
filename = "./front-react/src/pages/notice/entryNoticeDetail/entryNoticeDetail2.json"

# value를 모두 저장할 리스트
all_values = []

# value 추출을 위한 재귀 함수
def extract_values(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "value" and isinstance(v, str):
                all_values.append(v)
            else:
                extract_values(v)
    elif isinstance(obj, list):
        for item in obj:
            extract_values(item)

# 파일 읽어서 파싱
with open(filename, "r", encoding="utf-8") as f:
    data = json.load(f)

# value 추출
extract_values(data)

# value들을 하나의 문자열로 합침 (필요에 따라 구분자 \n 또는 ' ' 등 사용)
content_str = '\n'.join(all_values)
content_str = remove_emoji(content_str)

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

# notice_id, content_id를 COALESCE(MAX(content_id),0)+1로 동일하게 지정
cursor.execute("SELECT COALESCE(MAX(content_id), 0) + 1 FROM notice_content_tb")
next_id = cursor.fetchone()[0]

sql = """
    INSERT INTO notice_content_tb (content_id, notice_id, content)
    VALUES (%s, %s, %s)
"""
cursor.execute(sql, (next_id, next_id, content_str))

conn.commit()
cursor.close()
conn.close()
