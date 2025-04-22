# ----------------------------[TTS 호출 코드]----------------------------
from google.cloud import texttospeech  # Google Cloud TTS API 클라이언트from db import get_nickname, get_audio_count
import os

# py 파일 호출
from config import AUDIO_FILES_DIR
from db import get_nickname, get_audio_count
from datetime import datetime

# 텍스트를 음성으로 변환하고, 음성 파일(MP3)을 저장하는 함수
def text_to_speech(text, user_uuid):
    clean_text = text.replace("<br><br>", " ") # 화면 출력용 줄바꿈 태그 <br><br>는 음성 출력에 불필요하므로 공백으로 대체

    client = texttospeech.TextToSpeechClient() # Google Cloud TTS 클라이언트 객체 생성
    input_text = texttospeech.SynthesisInput(text=clean_text) # 변환할 텍스트 지정 (SynthesisInput 객체로 감쌈)
    
    # 사용할 음성 설정
    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR",  # 사용할 언어는 한국어
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL  # 성별은 중립 (male/female도 선택 가능)
    )

    # 오디오 출력 설정
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3  # 출력 포맷은 MP3 (기본은 LINEAR16)
    )

    # 실제 TTS 변환 요청을 서버로 보냄 → 음성 데이터가 포함된 응답 객체 반환
    response = client.synthesize_speech(input=input_text, voice=voice, audio_config=audio_config)

    # 음성 파일명을 사용자의 닉네임 기반으로 생성
    nickname = get_nickname(user_uuid)
    count = get_audio_count(user_uuid, 'bot')
    timestamp = datetime.now().strftime("%Y%m%d")
    tts_filename = f"{nickname}_bot_{timestamp}_{count}.mp3"

    # 닉넴임 별로 음성 폴더 생성
    user_dir = os.path.join(AUDIO_FILES_DIR, nickname)
    os.makedirs(user_dir, exist_ok=True)
    tts_filepath = os.path.join(user_dir, tts_filename)

    # MP3 음성 데이터를 파일로 저장
    with open(tts_filepath, "wb") as out:
        out.write(response.audio_content)
        print(f"TTS 음성 파일 저장: {tts_filepath}")  # 저장된 위치를 로그로 출력

    # 저장된 파일 경로를 리턴 → 클라이언트가 재생하거나 접근할 수 있도록 함
    return tts_filepath