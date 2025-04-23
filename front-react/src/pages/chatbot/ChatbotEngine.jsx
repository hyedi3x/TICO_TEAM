import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./chatbotEngine.css";

import axiosInstance from "../login/social/utils/axiosInstance";
import axios from "axios"; 

function ChatbotEngine({ showChat }) {
  const [recState, setRecState] = useState(false); // 녹음 상태 (true: 녹음 중, false: 중지)
  const [isRecordingUI, setIsRecordingUI] = useState(false); // 녹음 중 UI 상태
  const mediaRec = useRef(null); // 녹음 객체
  const audioChunks = useRef([]); // 오디오 데이터 저장
  const [chatList, setChatList] = useState([]); // 채팅 메시지 목록
  const [chats, setChats] = useState(""); // 현재 입력된 채팅
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 오류 상태
  const [isListening, setIsListening] = useState(false); // 데시벨 애니메이션 표시용
  const canvasRef = useRef(null);

  const user_uuid = localStorage.getItem("user_uuid"); // 로그인된 사용자 ID
  const nickname = localStorage.getItem("nickname");    // 닉네임 가져오기
  
  // ---------------------[채팅 입력 핸들러]-------------------------
  const inputChange = (e) => {
    setChats(e.target.value); // 채팅 상태 업데이트
  };

  // ---------------------[채팅 전송 핸들러]-------------------------
  const handleSend = () => {
    setError(null); // 에러 초기화
    if (chats.trim()) {
      setChatList([...chatList, { text: chats, sender: "user" }]); // 채팅 목록에 사용자의 메시지 추가
      sendFaqQuestion(chats, user_uuid); // FAQ 엔드포인트로 POST 요청 보내기
      sendTextToSpring(chats, "user"); // 스프링 부트로 메시지 전송 (원래 기능)
      setChats(""); // 채팅 입력창 비우기
    }
  };

  // ---------------------[Enter 키 이벤트 핸들러]-------------------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend(); // Enter 키 입력 시 메시지 전송
    }
  };

  // ----------[마이크 입력의 실시간 주파수 볼륨 데이터를 바(bar) 형태로 시각화]----------
  let animationId = null;

  function drawWaveform(analyserNode) {
    const canvas = canvasRef.current; // <canvas> DOM 요소 호출
    if (!canvas || !analyserNode) return; // 예외 방지

    const ctx = canvas.getContext("2d"); // 2D 캔버스 렌더링 컨텍스트
    const bufferLength = analyserNode.frequencyBinCount; // frequencyBinCount : 분석할 주파수 데이터 개수
    const dataArray = new Uint8Array(bufferLength); // bufferLength를 저장할 배열 선언

    const draw = () => {
      analyserNode.getByteFrequencyData(dataArray); // 마이크의 오디오 데이터를 dataArray에 저장(주파수 저장)

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 3; // 막대 너비
      const gap = 2; // 막대 사이 간격
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 1.5; // 볼륨 크기 → 높이로 변환
        ctx.fillStyle = "rgba(200, 200, 200, 0.95)"; // 밝은 회색 막대
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + gap;
      }

      animationId = requestAnimationFrame(draw); // 애니메이션 반복 호출
    };

    draw();
  }

  // ---------------------[음성 입력 감지 및 음성 인식 자동 종료 변수 선언]-------------------------
  let silenceTimer = null; // 일정 시간 말을 하지 않으면 녹음 종료시키는 타이머
  let audioContext = null; // Web Audio API의 오디오 컨텍스트 객체
  let analyser = null; // 실시간 볼륨 분석용 AnalyserNode
  let intervalId = null; // 볼륨 감지용 setInterval 타이머 ID
  let startTime = null; // 녹음 시작 시간 (무음 감지 기준으로 사용)
  let lastVoiceTime = null; // 마지막으로 소리가 감지된 시간
  let hasSpoken = false; // 사용자가 말을 시작했는지 여부

  // 녹음 시작
  const startRec = () => {
    setError(null); // 에러 초기화
    navigator.mediaDevices // 사용자 마이크 접근 요청
      .getUserMedia({ audio: true }) // 오디오 스트림 요청
      .then((stream) => {
        startTime = Date.now(); // 녹음 시작 시간 저장
        lastVoiceTime = null; // 소리 감지 전엔 null로 시작
        hasSpoken = false;

        mediaRec.current = new MediaRecorder(stream, {
          // MediaRecorder 객체 생성 (녹음용)
          mimeType: "audio/webm", // 오디오 포맷 지정
        });

        // Web Audio API 사용을 위한 AudioContext 생성
        audioContext = new AudioContext(); // 마이크 소리를 분석하는 장치 연결
        analyser = audioContext.createAnalyser(); // 오디오 분석기 생성
        audioContext.createMediaStreamSource(stream).connect(analyser); // 마이크 → 분석기 연결
        analyser.fftSize = 2048; // 분석 정확도 설정

        // setInterval을 이용한 무음 감지 루프
        const silenceCheckInterval = 300; // 300ms마다 체크
        // 볼륨 임계값 (0~255), 무음으로 판단할 최대 볼륨 마이크가 잡음을 생각보다 많이 잡아서 100~150사이는 잡음이 잡힌다고 생각해야함
        const silenceThreshold = 120;

        // 무음 감지 루프 시작
        intervalId = setInterval(() => {
          const buffer = new Uint8Array(analyser.frequencyBinCount); // 볼륨 데이터 버퍼 생성
          analyser.getByteFrequencyData(buffer); // 현재 볼륨 데이터 채우기
          const maxVolume = Math.max(...buffer); // 가장 큰 볼륨값 추출

          const now = Date.now(); // 현재 시간(밀리초 기준)
          const elapsed = now - startTime; // 녹음 시작 이후 경과된 시간

          // 10초 이후부터 무음 감지
          if (maxVolume >= silenceThreshold) {
            // 음성 입력의 최대 볼륨 값이 설정한 임계값(silenceThreshold) 보다 크면,
            lastVoiceTime = now; // 소리가 마지막으로 감지된 시간
            hasSpoken = true; // 사용자 음성을 기록

            // 음성이 있으면 10초 무응답 종료 예약을 취소
            if (silenceTimer) {
              clearTimeout(silenceTimer);
              silenceTimer = null;
            }
          }

          // 로그 확인 (현재시간, 볼륨 크기, 음성인식 여부, 마지막 음성 시간, 마지막 음성 시간 이후 시간)
          console.log({
            now,
            maxVolume,
            hasSpoken,
            lastVoiceTime,
            timeSinceLastVoice: lastVoiceTime ? now - lastVoiceTime : null,
            elapsedSinceStart: elapsed,
          });

          // timeSinceLast : 마지막 음성 감지 시간부터 현재까지 흐른 시간
          const timeSinceLast = lastVoiceTime ? now - lastVoiceTime : null;

          // 음성이 인식되었고, 녹음 시작 후 10초가 지났고, 음성 감지 시간이 존재하고, 감지 이후 1초가 지났다면
          if (
            hasSpoken &&
            elapsed > 10000 &&
            timeSinceLast !== null &&
            timeSinceLast > 1000
          ) {
            // 10초 이후이고, 마지막 소리 이후 1.5초 경과 → 종료
            if (!silenceTimer) {
              silenceTimer = setTimeout(() => {
                stopRec(); // 녹음 종료
                clearInterval(intervalId); // 루프 종료
                silenceTimer = null;
              }, 0); // 바로 종료
            }
          }
        }, silenceCheckInterval);

        // MediaRecorder가 데이터를 받을 때마다 실행되는 이벤트
        mediaRec.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data); // 오디오 데이터 저장
        };

        // 녹음 종료 시 실행
        mediaRec.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          audioChunks.current = []; // 메모리 초기화
          sendAudio(audioBlob); // 오디오 데이터 Flask 서버로 전송
        };

        mediaRec.current.start(); // 녹음 시작
        setRecState(true); // 상태 값 업데이트
        setIsRecordingUI(true); // 녹음 중 표시
        setIsListening(true); // 음성 인식 UI 출력

        // 캔버스가 렌더된 후 실행 보장
        setTimeout(() => {
          drawWaveform(analyser);
        }, 100);
      })
      .catch((err) => {
        setError("마이크 접근 권한이 없습니다."); // 에러 메시지 출력
      });
  };

  // 녹음 중지
  const stopRec = () => {
    if (mediaRec.current && mediaRec.current.state !== "inactive") {
      mediaRec.current.stop(); // 녹음 중지
      setRecState(false);
      setIsRecordingUI(false);
      setIsListening(false); // 음성 인식 UI 중지
    }

    // 감지 루프 해제
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    // 무음 타이머 해제
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }

    // 오디오 컨텍스트 종료
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    // 파형 애니메이션 종료
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  // ---------------------[오디오 파일을 Flask 서버로 전송하여 음성 인식 처리]-------------------------
  const sendAudio = (audioBlob) => {
    const audioFile = new File([audioBlob], "recorded_audio.webm", {
      type: "audio/webm",
    });
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("user_uuid", user_uuid);

    // 외부 서버이므로 직접 URL 사용
    axios
      .post("http://43.202.174.19:5000/speech_to_text", formData)
      .then((res) => {
        const data = res.data;
        if (data.transcript) {
          // 음성 인식 후 사용자 메시지 추가
          setChatList([...chatList, { text: data.transcript, sender: "user" }]);
          // 텍스트 메시지와 함께 스프링 부트 전송
          sendTextToSpring(data.transcript, "user", data.filepath);
          // FAQ 엔드포인트도 호출하여 챗봇 응답을 받음
          sendFaqQuestion(data.transcript, user_uuid);
          setIsRecordingUI(false); // 자동으로 UI 전환
        } else {
          setError("음성 인식에 실패했습니다."); // 실패 시 에러 메시지
        }
      })
      .catch((error) => {
        setError("서버 연결에 실패했습니다."); // 서버 연결 실패 시 에러 메시지
      });
  };

  // ---------------------[스프링 부트로 텍스트 메시지를 전송하는 함수]-------------------------
  function sendTextToSpring(text, sender, filePath) {
    axiosInstance
      .post("/api/messages", {
        user_uuid: user_uuid,
        msg: text, // 사용자 또는 챗봇의 메시지
        sender: sender, // 메시지 발신자 ("user" 또는 "bot")
        record: filePath ? "Y" : "N", // 음성 파일 경로가 있으면 'Y' (음성), 없으면 'N'
        filePath: filePath || null, // 음성 파일 경로
      })
      .then((res) => {
        console.log("스프링 부트 응답:", res.data);
      })
      .catch((error) => {
        console.error("스프링 부트 전송 오류:", error);
      });
  }

  // ---------------------[Flask의 /chatbot/faq 엔드포인트로 POST 요청을 보내는 함수]-------------------------
  function sendFaqQuestion(question, user_uuid) {
    axios
      .post("http://43.202.174.19:5000/chatbot/faq", {
        question: question, // 입력한 텍스트나 음성 데이터를 question 값으로 전송
        user_uuid: user_uuid,
      })
      .then((res) => {
        const data = res.data;
        console.log("FAQ 응답:", data);
        // FAQ 응답을 받아서 챗봇 메시지로 추가 (sender를 "bot"으로 설정)
        setChatList((prevList) => [
          // prevList : 이전 채팅 값 (업데이트)
          ...prevList,
          { text: data.answer, sender: "bot" }, // 챗봇 응답 답변 answer로 배열에 추가
        ]);

        // TTS 파일이 있으면 재생
        if (data.tts_filepath) {
          const filename = data.tts_filepath.split('/').pop();  // 파일명만 추출
          const audio = new Audio(`http://43.202.174.19:5000/audio/${nickname}/${filename}`);
          audio.play().catch((error) => {
            console.error("TTS 음성 재생 오류:", error);
          });
        }
      })
      .catch((error) => {
        console.error("FAQ 요청 오류:", error);
      });
  }

  // ---------------------[스프링 부트에서 사용자별 메시지 목록을 가져오는 함수 (채팅창 열릴 때마다 호출)]-------------------------
  useEffect(() => {
    if (!user_uuid || !showChat) return;
    setLoading(true);
    axiosInstance
      .get(`/api/messages/user/${user_uuid}`)
      .then((res) => {
        const data = res.data;
        setChatList(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("메시지 불러오기 실패")) // 실패 시 에러 메시지
      .finally(() => setLoading(false)); // 로딩 종료
  }, [user_uuid, showChat]);

  // 채팅이 추가될 때마다 맨 아래로 스크롤
  const messagesEndRef = useRef(null);

  // ---------------------[chatList가 변경될 때마다 실행되는 리액트 훅]-------------------------
  useEffect(() => {
    if (messagesEndRef.current) {
      // scrollIntoView : 자동 스크롤, behavior: "smooth" - 부드러운 애니메이션
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatList]);

  return (
    <div className="chat-wrap">
      {/* 음성 인식 파형 css */}
      {isListening && (
        <>
          <div className="listening-overlay" />
          <canvas className="waveform-canvas" ref={canvasRef}></canvas>
        </>
      )}

      <div className="messages">
        {/* 채팅 목록 불러오기 */}
        {Array.isArray(chatList) ? (
          chatList.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {/* answer에 HTML이 포함될 수 있도록 dangerouslySetInnerHTML 사용 */}
              {/* 파이썬에서 응답받은 answer에 html 문자열 코드가 있기 때문에 이를 실제 html 처럼 렌더링해줌 */}
              <div
                dangerouslySetInnerHTML={{
                  __html: message.text || message.msg,
                }}
              />
            </div>
          ))
        ) : (
          <div className="error">
            메시지 데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        )}
        <div ref={messagesEndRef} /> {/* 채팅 하단 스크롤용 ref */}
      </div>

      <div className="input-wrap">
        {loading && <div className="loading">텍스트 변환 중...</div>}
        {error && <div className="error">오류: {error}</div>}

        {/* 채팅창 기본 멘트 */}
        <div className="input-row">
          <input
            type="text"
            value={chats}
            onChange={inputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isRecordingUI} // 녹음 중에는 입력 비활성화
          />

          {/* 마이크 사용 여부 & 텍스트 입력 여부로 아이콘 변경 */}
          {isRecordingUI ? (
            <div className="mic-btn mic-rec" onClick={stopRec}>
              <FontAwesomeIcon icon={faMicrophone} className="mic-icon" />
            </div>
          ) : chats.trim() ? (
            <div className="send-btn" onClick={handleSend}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </div>
          ) : (
            <div className="mic-btn mic-stop" onClick={startRec}>
              <FontAwesomeIcon icon={faMicrophone} className="mic-icon" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatbotEngine;
