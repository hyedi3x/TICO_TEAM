import React, { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./chatbotEngine.css";

import axiosInstance from "../login/social/utils/axiosInstance";
import axios from "axios";

function ChatbotEngine({ showChat }) {
  // ---------------------[상태 및 참조 변수 선언]-------------------------
  const [recState, setRecState] = useState(false);   // 녹음 상태 (true: 녹음 중, false: 중지)
  const [isRecordingUI, setIsRecordingUI] = useState(false);  // 녹음 중 UI 상태
  const [chatList, setChatList] = useState([]);   // 채팅 메시지 목록
  const [chats, setChats] = useState("");    // 현재 입력된 채팅
  const [loading, setLoading] = useState(false);  // 로딩 상태
  const [error, setError] = useState(null);       // 오류 상태
  const [isListening, setIsListening] = useState(false); // 데시벨 애니메이션 표시용

  const mediaRec = useRef(null);   // 녹음 객체
  const audioChunks = useRef([]);  // 오디오 데이터 저장
  const canvasRef = useRef(null);  // 파형 표시용 캔버스

  const intervalId = useRef(null); // 볼륨 감지 루프 ID
  const silenceTimer = useRef(null);  // 무음 타이머
  const audioContext = useRef(null);  // 오디오 컨텍스트
  const analyser = useRef(null);   // 분석기
  const animationId = useRef(null);   // 애니메이션 루프 ID

  const startTime = useRef(null);   // 녹음 시작 시간
  const lastVoiceTime = useRef(null);  // 마지막으로 소리가 감지된 시간
  const hasSpoken = useRef(false);  // 사용자가 말을 시작했는지 여부

  const user_uuid = localStorage.getItem("user_uuid"); // 로그인된 사용자 ID
  const nickname = localStorage.getItem("nickname");  // 닉네임

  // ---------------------[채팅 입력 핸들러]-------------------------
  const inputChange = (e) => {
    setChats(e.target.value); // 채팅 상태 업데이트
  };

  // ---------------------[채팅 전송 핸들러]-------------------------
  const handleSend = () => {
    setError(null);  // 에러 초기화
    if (chats.trim()) {
      setChatList([...chatList, { text: chats, sender: "user" }]);  // 채팅 목록에 사용자의 메시지 추가
      sendFaqQuestion(chats, user_uuid);  // FAQ 엔드포인트로 POST 요청 보내기
      sendTextToSpring(chats, "user");    // 스프링 부트로 메시지 전송 (원래 기능)
      setChats("");  // 채팅 입력창 비우기
    }
  };

  // ---------------------[Enter 키 이벤트 핸들러]-------------------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();  // Enter 키 입력 시 메시지 전송
    }
  };

  // ----------[마이크 입력의 실시간 주파수 볼륨 데이터를 바(bar) 형태로 시각화]----------
  const drawWaveform = useCallback((analyserNode) => {
    const canvas = canvasRef.current;     // <canvas> DOM 요소 호출
    if (!canvas || !analyserNode) return; // 예외 방지

    const ctx = canvas.getContext("2d");  // 2D 캔버스 렌더링 컨텍스트
    const bufferLength = analyserNode.frequencyBinCount;  // frequencyBinCount : 분석할 주파수 데이터 개수
    const dataArray = new Uint8Array(bufferLength);  // bufferLength를 저장할 배열 선언

    const draw = () => {
      analyserNode.getByteFrequencyData(dataArray);  // 마이크의 오디오 데이터를 dataArray에 저장(주파수 저장)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 3;  // 막대 너비
      const gap = 2;  // 막대 사이 간격
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 1.5;  // 볼륨 크기 → 높이로 변환
        ctx.fillStyle = "rgba(200, 200, 200, 0.95)";  // 밝은 회색 막대
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + gap;
      }

      animationId.current = requestAnimationFrame(draw);  // 애니메이션 반복 호출
    };

    draw();
  }, []);

  // ---------------------[음성 입력 감지 및 음성 인식 자동 종료 변수 선언]-------------------------
  const startRec = () => {
    setError(null);  // 이전 오류 메시지 초기화

    // 사용자에게 마이크 접근 권한 요청
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        startTime.current = Date.now(); // 녹음 시작 시각 기록
        lastVoiceTime.current = null;  // 마지막으로 소리가 감지된 시점 초기화
        hasSpoken.current = false;  // 아직 사용자가 말을 시작하지 않음

        // MediaRecorder 객체 생성 (음성 녹음용)
        mediaRec.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        // Web Audio API의 AudioContext 생성 및 AnalyserNode 연결
        audioContext.current = new AudioContext();  // 오디오 처리용 컨텍스트
        analyser.current = audioContext.current.createAnalyser();  // 주파수 분석기
        audioContext.current
          .createMediaStreamSource(stream)
          .connect(analyser.current);  // 마이크 입력을 분석기로 연결
        analyser.current.fftSize = 2048;  // 주파수 분석 정확도 설정

        // 무음 감지를 위한 변수 설정
        const silenceThreshold = 120;  // 이 값 이상이면 음성으로 판단
        const silenceCheckInterval = 300;  // 300ms마다 무음 여부 검사

        // 무음 감지 시작
        intervalId.current = setInterval(() => {
          const buffer = new Uint8Array(analyser.current.frequencyBinCount); // 주파수 데이터 배열 생성
          analyser.current.getByteFrequencyData(buffer);  // 주파수 데이터 수집
          const maxVolume = Math.max(...buffer);  // 가장 큰 볼륨값 추출

          const now = Date.now(); // 현재 시간
          const elapsed = now - startTime.current; // 녹음 시작 이후 경과 시간

          // 설정한 볼륨 임계값 이상이면 소리가 있다고 판단
          if (maxVolume >= silenceThreshold) {
            lastVoiceTime.current = now; // 마지막으로 소리가 감지된 시각 갱신
            hasSpoken.current = true;    // 사용자가 말을 시작했다고 기록

            // 무음 종료 예약이 되어 있다면 취소
            if (silenceTimer.current) {
              clearTimeout(silenceTimer.current);
              silenceTimer.current = null;
            }
          }

          // 마지막 소리 이후 경과 시간 계산
          const timeSinceLast = lastVoiceTime.current
            ? now - lastVoiceTime.current
            : null;

          // 사용자가 말을 했고, 녹음 시작 후 10초가 지났으며, 마지막 소리 이후 1초가 지났으면
          if (
            hasSpoken.current &&
            elapsed > 10000 &&
            timeSinceLast !== null &&
            timeSinceLast > 1000
          ) {
            // 음성이 없어진 뒤 1초 이상 지속되면 종료 예약
            if (!silenceTimer.current) {
              silenceTimer.current = setTimeout(() => {
                stopRec(); // 녹음 중지
                clearInterval(intervalId.current); // 무음 감지 중단
                silenceTimer.current = null; // 타이머 초기화
              }, 0); // 즉시 중지
            }
          }
        }, silenceCheckInterval);

        // MediaRecorder가 데이터를 수집할 때마다 실행
        mediaRec.current.ondataavailable = (e) => {
          audioChunks.current.push(e.data); // 오디오 데이터를 배열에 저장
        };

        // MediaRecorder가 중지되었을 때 실행
        mediaRec.current.onstop = () => {
          const blob = new Blob(audioChunks.current, { type: "audio/webm" }); // 오디오 데이터 blob 생성
          audioChunks.current = []; // 버퍼 초기화
          sendAudio(blob); // 서버로 전송
        };

        mediaRec.current.start(); // 녹음 시작
        setRecState(true);        // 녹음 상태 변경
        setIsRecordingUI(true);   // 녹음 UI 상태 표시
        setIsListening(true);     // 파형 UI 활성화

        // 파형 시각화 실행 (약간의 지연 후)
        setTimeout(() => drawWaveform(analyser.current), 100);
      })
      .catch(() => setError("마이크 접근 권한이 없습니다.")); // 마이크 권한 오류 처리
  };

  // ---------------------[녹음 중지 함수]-------------------------
  const stopRec = useCallback(() => {
    if (mediaRec.current && mediaRec.current.state !== "inactive") {
      mediaRec.current.stop(); // 녹음 중지
      setRecState(false);
      setIsRecordingUI(false);
      setIsListening(false); // 음성 인식 UI 중지
    }

    // 감지 루프 해제
    if (intervalId.current) clearInterval(intervalId.current);

    // 무음 타이머 해제
    if (silenceTimer.current) clearTimeout(silenceTimer.current);

    // 오디오 컨텍스트 종료
    if (audioContext.current) audioContext.current.close();

    // 파형 애니메이션 종료
    if (animationId.current) cancelAnimationFrame(animationId.current);
  }, []);

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
      .post("http://localhost:5000/speech_to_text", formData)
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
      .catch(() => {
        setError("서버 연결에 실패했습니다."); // 서버 연결 실패 시 에러 메시지
      });
  };

  // ---------------------[스프링 부트로 텍스트 메시지를 전송하는 함수]-------------------------
  function sendTextToSpring(text, sender, filePath) {
    axiosInstance
      .post("/api/messages", {
        user_uuid: user_uuid,
        msg: text,      // 사용자 또는 챗봇의 메시지
        sender: sender, // 메시지 발신자 ("user" 또는 "bot")
        record: filePath ? "Y" : "N", // 음성 파일 경로가 있으면 'Y' (음성), 없으면 'N'
        filePath: filePath || null,   // 음성 파일 경로
      })
      .then((res) => {
        console.log("스프링 부트 응답:", res.data);
      })
      .catch((error) => {
        console.error("스프링 부트 전송 오류:", error);
      });
  }

  // ---------------------[Flask의 /chatbot엔드포인트로 POST 요청을 보내는 함수]-------------------------
  function sendFaqQuestion(question, user_uuid) {
    axios
      .post("http://localhost:5000/chatbot", {
        question: question,    // 입력한 텍스트나 음성 데이터를 question 값으로 전송
        user_uuid: user_uuid,
      })
      .then((res) => {
        const data = res.data;
        console.log("FAQ 응답:", data);
        // FAQ 응답을 받아서 챗봇 메시지로 추가 (sender를 "bot"으로 설정)
        setChatList((prevList) => [
          // prevList : 이전 채팅 값 (업데이트)
          ...prevList,
          { text: data.response, sender: "bot" },  // 챗봇 응답 답변 answer로 배열에 추가
        ]);

        // TTS 파일이 있으면 재생
        if (data.tts_filepath) {
          const filename = data.tts_filepath.split("/").pop(); // 파일명만 추출
          new Audio(`http://localhost:5000/audio/${nickname}/${filename}`)
            .play()
            .catch((error) => {
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
    if (!user_uuid) return;

    if (!showChat) {
      stopRec();   // 채팅창 닫힐 때 녹음 중지
      return;
    }
    setLoading(true);
    axiosInstance
      .get(`/api/messages/user/${user_uuid}`)
      .then((res) => {
        const data = res.data;
        setChatList(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("메시지 불러오기 실패"))  // 실패 시 에러 메시지
      .finally(() => setLoading(false));   // 로딩 종료
  }, [user_uuid, showChat, stopRec]);

  // 채팅이 추가될 때마다 맨 아래로 스크롤
  const messagesEndRef = useRef(null);

  // ---------------------[chatList가 변경될 때마다 실행되는 리액트 훅]-------------------------
  useEffect(() => {
    // scrollIntoView : 자동 스크롤, behavior: "smooth" - 부드러운 애니메이션
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatList]);

  return (
    <div className="chat-wrap">
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
      {/* 파형을 input-wrap 바로 위에 위치 */}
      {isListening && (
        <div className="listening-overlay">
          <canvas className="waveform-canvas" ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
}

export default ChatbotEngine;
