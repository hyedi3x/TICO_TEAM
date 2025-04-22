# ---------------------[speech_to_text 및 chatbot_faq 라우팅 정의]--------------------
from flask import Blueprint  # flask 내장 라이브러리 

# py 파일 호출 (요청이 들어왔을 때 실행할 핸들러 함수)
from speech_to_text import handle_speech_to_text  
from chatbot_faq import handle_chatbot_faq

# Blueprint : 라우팅을 여러 파일로 나눌 수 있게 해주는 구조
routes = Blueprint('routes', __name__)

# post 요청 시 함수 실행 
routes.route('/speech_to_text', methods=['POST'])(handle_speech_to_text)
routes.route('/chatbot/faq', methods=['POST'])(handle_chatbot_faq)
