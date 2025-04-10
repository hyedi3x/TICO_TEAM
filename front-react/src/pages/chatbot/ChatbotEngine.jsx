import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./chatbotEngine.css";

function ChatbotEngine({ showChat }) {
  const [recState, setRecState] = useState(false); // 녹음 상태 (true: 녹음 중, false: 중지)
  const mediaRec = useRef(null); // 녹음 객체
  const audioChunks = useRef([]); // 오디오 데이터 저장
  const [chatList, setChatList] = useState([]); // 채팅 메시지 목록
  const [chats, setChats] = useState(""); // 현재 입력된 채팅
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 오류 상태

  const user_uuid = localStorage.getItem("user_uuid"); // 로그인된 사용자 ID

  // 채팅 입력 핸들러
  const inputChange = (e) => {
    setChats(e.target.value); // 채팅 상태 업데이트
  };

  // 채팅 전송 핸들러
  const handleSend = () => {
    setError(null); // 에러 초기화
    if (chats.trim()) {
      // 채팅 목록에 사용자의 메시지 추가
      setChatList([...chatList, { text: chats, sender: "user" }]);

      // FAQ 엔드포인트로 POST 요청 보내기
      sendFaqQuestion(chats, user_uuid);

      // 스프링 부트로 메시지 전송 (원래 기능)
      sendTextToSpring(chats, "user");

      setChats(""); // 채팅 입력창 비우기
    }
  };

  // Enter 키 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend(); // Enter 키 입력 시 메시지 전송
    }
  };

  // 녹음 시작
  const startRec = () => {
    setError(null); // 에러 초기화
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRec.current = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        mediaRec.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data); // 오디오 데이터 저장
        };

        mediaRec.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          audioChunks.current = []; // 메모리 초기화
          sendAudio(audioBlob); // 오디오 데이터 서버로 전송
        };

        mediaRec.current.start();
        setRecState(true); // 녹음 시작
      })
      .catch((err) => {
        setError("마이크 접근 권한이 없습니다."); // 에러 메시지 출력
      });
  };

  // 녹음 중지
  const stopRec = () => {
    if (mediaRec.current) {
      mediaRec.current.stop(); // 녹음 중지
      setRecState(false);
    }
  };

  // 오디오 파일을 Flask 서버로 전송하여 음성 인식 처리
  const sendAudio = (audioBlob) => {
    const audioFile = new File([audioBlob], "recorded_audio.webm", {
      type: "audio/webm",
    });
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("user_uuid", user_uuid);
    fetch("http://localhost:5000/speech_to_text", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.transcript) {
          // 음성 인식 후 사용자 메시지 추가
          setChatList([...chatList, { text: data.transcript, sender: "user" }]);
          // 텍스트 메시지와 함께 스프링 부트 전송
          sendTextToSpring(data.transcript, "user", data.filepath);
          // FAQ 엔드포인트도 호출하여 챗봇 응답을 받음
          sendFaqQuestion(data.transcript, user_uuid);
        } else {
          setError("음성 인식에 실패했습니다."); // 실패 시 에러 메시지
        }
      })
      .catch((error) => {
        setError("서버 연결에 실패했습니다."); // 서버 연결 실패 시 에러 메시지
      });
  };

  // 스프링 부트로 텍스트 메시지를 전송하는 함수
  function sendTextToSpring(text, sender, filePath) {
    fetch("http://localhost:8081/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_uuid: user_uuid,
        msg: text, // 사용자 또는 챗봇의 메시지
        sender: sender, // 메시지 발신자 ("user" 또는 "bot")
        record: filePath ? "Y" : "N", // 음성 파일 경로가 있으면 'Y' (음성), 없으면 'N'
        filePath: filePath || null, // 음성 파일 경로
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("스프링 부트 응답:", data); // 서버 응답 출력
      })
      .catch((error) => {
        console.error("스프링 부트 전송 오류:", error); // 오류 처리
      });
  }

  // Flask의 /chatbot/faq 엔드포인트로 POST 요청을 보내는 함수
  function sendFaqQuestion(question, user_uuid) {
    fetch("http://localhost:5000/chatbot/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,    // 입력한 텍스트나 음성 데이터를 question 값으로 전송
        user_uuid: user_uuid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("FAQ 응답:", data);
        // FAQ 응답을 받아서 챗봇 메시지로 추가 (sender를 "bot"으로 설정)
        setChatList((prevList) => [    // prevList : 이전 채팅 값 (업데이트)
          ...prevList,
          { text: data.answer, sender: "bot" },  // 챗봇 응답 답변 answer로 배열에 추가
        ]);
      })
      .catch((error) => {
        console.error("FAQ 요청 오류:", error);
      });
  }

  // 스프링 부트에서 사용자별 메시지 목록을 가져오는 함수 (채팅창 열릴 때마다 호출)
  useEffect(() => {
    if (!user_uuid || !showChat) return;
    setLoading(true);
    fetch(`http://localhost:8081/api/messages/user/${user_uuid}`)
      .then((res) => res.json())
      //  서버에서 응답받은 데이터를 안전하게 상태(chatList)에 반영, 빈배열이면 [] 반환, 데이터가 정상 반환되면 data로 값이 들어옴
      .then((data) => setChatList(Array.isArray(data) ? data : []))
      .catch(() => setError("메시지 불러오기 실패")) // 실패 시 에러 메시지
      .finally(() => setLoading(false)); // 로딩 종료
  }, [user_uuid, showChat]);

  // 채팅이 추가될 때마다 맨 아래로 스크롤
  const messagesEndRef = useRef(null);

  // chatList가 변경될 때마다 실행되는 리액트 훅
  useEffect(() => {
    if (messagesEndRef.current) {
      // scrollIntoView : 자동 스크롤, behavior: "smooth" - 부드러운 애니메이션
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });  
    }
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
              <div dangerouslySetInnerHTML={{ __html: message.text || message.msg }} />
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
          />

          {/* 마이크 사용 여부 & 텍스트 입력 여부로 아이콘 변경 */}
          {chats.trim() ? (
            <div className="send-btn" onClick={handleSend}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </div>
          ) : (
            <div
              className={`mic-btn ${recState ? "mic-rec" : "mic-stop"}`}
              onClick={recState ? stopRec : startRec}
            >
              <FontAwesomeIcon icon={faMicrophone} className="mic-icon" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatbotEngine;
