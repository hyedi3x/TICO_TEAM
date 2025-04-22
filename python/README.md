# 📌 Flask 기반 챗봇 응답 시스템

## 프로젝트 구조
```
/my_flask_app
├── app.py              # Flask 앱 초기화 및 Blueprint 등록
├── routes.py           # speech_to_text 및 chatbot_faq 라우팅 정의
├── db.py               # DB 연결, 닉네임 및 채팅 로그 저장 함수
├── config.py           # 환경변수 및 오디오 저장 경로 설정
├── speech_to_text.py   # 음성 → 텍스트 변환 기능 (Google STT 처리)
├── text_to_speech.py   # 텍스트 → 음성 변환 기능 (Google TTS 처리)
├── chatbot_faq.py      # FAQ 기반 응답 처리 및 저장
└── static/
    └── audio_files/    # 음성 파일 저장 디렉토리
```
<br>

## 📄 conda install list
```shell
conda create -n tico python=3.9.21  # 아나콘다 가상환경 설정, conda create -n <가상환경명> python=<버전>
conda env list               # 가상환경 활성화 확인 

conda activate tico          # 생성한 가상환경을 활성화하는 방법
conda list     # conda 설치 목록 확인 

conda install flask          # 웹 애플리케이션 프레임 워크, version 3.1.0 
conda install flask-cors     # Flask CORS (Cross-Origin Resource Sharing) 라이브러리, 3.0.10
conda install -c conda-forge pymysql       # MariaDB 연동, 1.0.2
conda install python-dotenv  # env 파일 로드, 0.21.0
conda install requests       # HTTP 요청, 2.32.3 (HTML 반환)
conda install beautifulsoup4 # 크롤링 용, HTML, XML 문서에서 원하는 데이터를 쉽게 추출할 수 있도록 도와주는 파이썬 라이브러리
conda install -c conda-forge selenium   # 브라우저 자동화 도구, 실제 브라우저처럼 동작해서 렌더링된 요소까지 볼 수 있음(javascript 동적 구조도 가져올 수 있음)
pip install webdriver-manager  # Selenium을 사용할 때 브라우저 드라이버를 자동으로 다운로드하고 관리

# conda 라이브러리 구축 안되어있을 경우 참조
conda install -c conda-forge numpy=1.26.4
conda install -c conda-forge pandas=2.2.3
conda install -c conda-forge matplotlib=3.9.2
conda install -c conda-forge scikit-learn=1.6.1
conda install -c conda-forge scipy=1.13.1
conda install -c conda-forge seaborn=0.13.2

# 구글 라이브러리는 pip install 만 가능 (conda prompt 환경에서 설치)
pip install --upgrade google-cloud-speech   # google-speech 라이브러리 (음성 텍스트 변환)
pip install google-cloud-texttospeech # google-texttospeech 라이브러리 (텍스트 음성 변환)
```
<br/><br/>

## 💾 시스템 환경 변수 설정 
Google Cloud Speech-to-Text에서 발급한 json키를 환경변수에 등록한다. 
<br/><br/>
<img src="./chatbot/imgs/system_settings_gspeech_api.png" alt="시스템 환경변수, api 설정">

## 파이썬 서버 실행 
cd python/chatbot/ 이동 → python app.py  <br><br>


# 흐름도 
## 🎤 `/speech_to_text` (React → Flask)
①  **React**에서 사용자가 녹음한 *audio* 파일과 *user_uuid*를 *FormData*로 Flask 서버에 POST 전송 <br>
→ `POST /speech_to_text` <br>

②  `routes.py`에서 해당 요청을 `speech_to_text.py`의 **`handle_speech_to_text()`**로 라우팅 <br>

**`speech_to_text.py`의 흐름:**
- `get_nickname()` 및 `get_audio_count()` 호출 → `db.py`에서 닉네임 및 파일 인덱스 조회
- 음성 파일을 `static/audio_files/` 경로에 저장
- **Google Cloud Speech-to-Text API**로 텍스트 변환
- 클라이언트로 JSON 반환:
  ```json
  {
    "transcript": "텍스트 변환 결과",
    "filepath": "저장된 음성 파일 경로"
  }
  ```
- React는 해당 응답을 받아 텍스트와 음성 경로를 Spring Boot 서버로 전달하여 로그 저장 수행
<br><br>

### 💬 `/chatbot/faq` (음성/텍스트 질문 → FAQ 검색 → 음성/텍스트 응답)
① **React**에서 사용자가 입력한 질문과 `user_uuid`를 JSON 형식으로 Flask 서버에 POST 전송 <br> 
→ `POST /chatbot/faq` <br>
② `routes.py`에서 해당 요청을 `chatbot_faq.py`의 ***handle_chatbot_faq( )*** 로 라우팅  <br><br>

**`chatbot_faq.py`의 흐름:**
- ***get_faq_from_db()*** 로 MariaDB의 FAQ 데이터 조회
- ***find_best_answer()*** 함수에서 **TF-IDF + 코사인 유사도**로 가장 유사한 질문 탐색
- 사용자의 마지막 메시지 유형(record)을 DB에서 조회
  ```
  - 만약 마지막 메시지가 음성(record='Y') 이라면:
    - `text_to_speech()` 호출 → 응답을 mp3로 변환하고 파일 저장
    - `save_to_db()`로 변환된 음성 응답을 DB에 저장
    - JSON으로 텍스트 + 음성 경로 반환

  - 텍스트(record='N')일 경우:
    - 음성 변환 없이 텍스트만 저장
    - 텍스트 응답만 반환
  ```

- 응답 예시:
  ```json
  {
    "answer": "FAQ 응답 텍스트",
    "tts_filepath": "/audio/파일명.mp3"
  }
  ```
<br><br>

## 🌐 클라이언트 연동 흐름 요약 (React → Flask → Spring Boot)
1. React에서 사용자가 마이크로 녹음하거나 질문 입력
2. `/speech_to_text` → 텍스트 변환 → React가 받아 `/api/messages`로 Spring Boot 저장
3. `/chatbot/faq` → 텍스트 유사도 분석 → 음성 응답 시 TTS 처리 → JSON 반환
4. React가 응답을 받아 챗창에 표시 + TTS 파일 자동 재생
