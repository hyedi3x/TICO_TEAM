# 베이스 이미지: Python 3.9 사용
FROM python:3.9

# 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# 로컬의 requirements.txt와 소스 코드 복사
COPY requirements.txt .  
COPY . .

# 필요한 패키지 설치
# RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Flask 서버가 사용하는 포트
EXPOSE 5000

# Flask 애플리케이션 실행 (파일 경로에 맞게 수정)
CMD ["python", "chatbot/app.py"]
