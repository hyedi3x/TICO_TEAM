import React, { useState, useEffect, useRef } from "react";
import MicRecord from "./MicRecord"; // MicRecord 컴포넌트
import robotImage from "../../imgs/chatbot_logo.png"; // 챗봇 로고
import "./chatbot.css"; // 아래에서 예시로 제공할 CSS를 임포트

function Chatbot() {
  const [showChat, setShowChat] = useState(false); // 채팅창 열기/닫기 상태
  const chatRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = () => {
      const user_uuid = localStorage.getItem("user_uuid");
      setIsLoggedIn(!!user_uuid);
    };
    checkLoginStatus();

    window.addEventListener("storage", checkLoginStatus);
    const interval = setInterval(checkLoginStatus, 500);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  // 로봇 아이콘 클릭 시
  const toggleChat = () => {
    if (!isLoggedIn) {
      alert("로그인을 먼저 해주세요.");
      return;
    }
    setShowChat(true);
  };

  // 오버레이(투명 배경) 클릭 시
  const closeOverlay = () => {
    setShowChat(false);
  };

  // 닫기 버튼 클릭 시
  const closeChat = () => {
    setShowChat(false);
  };

  // 바깥 영역 클릭 시 닫기
  useEffect(() => {
    const mouseDown = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        closeOverlay();
      }
    };
    document.addEventListener("mousedown", mouseDown);
    return () => document.removeEventListener("mousedown", mouseDown);
  }, []);

  return (
    <>
      {/* 챗봇 로고 (오른쪽 하단 열기용) */}
      <img
        src={robotImage}
        alt="로봇 이미지"
        className="chatbot-logo"
        onClick={toggleChat}
      />

      {showChat && (
        <>
          {/* 반투명 오버레이 */}
          <div className="chatbot-overlay" onClick={closeOverlay}></div>

          {/* 채팅창 래퍼 */}
          <div ref={chatRef} className="chatbot-window">
            {/* 닫기 버튼 */}
            <span className="close-button" onClick={closeChat}>
              X
            </span>

            {/* 실제 채팅 영역 (MicRecord) */}
            <MicRecord showChat={showChat} />
          </div>
        </>
      )}
    </>
  );
}

export default Chatbot;
