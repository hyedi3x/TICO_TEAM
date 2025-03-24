import React, { useState, useRef, useEffect } from 'react';
import MicRecord from './MicRecord';                   // MicRecord 객체 임포트
import robotImage from '../../imgs/chatbot_logo.png';

function Chatbot() {
  const [showChat, setShowChat] = useState(false);   // showChat: 채팅창 화면 표출 여부
  const chatRef = useRef(null);   // chatRef: 채팅창 div 요소에 대한 참조를 저장

  // 로봇 이미지 클릭 시 호출
  const toggleChat  = () => {
    setShowChat(true);     // 채팅창 표시(true : 표시, false : 거짓)
  };

  // 투명 레이어 클릭 시 호출 
  const closeOverlay = () => {
    setShowChat(false);
  };

  // 닫기 버튼 클릭 시 호출
  const closeChat = () => {
    setShowChat(false);
  };

  useEffect(() => {
    // 외부 클릭 처리 함수 
    const mouseDown = (event) => {
      // 채팅창 외부 클릭 시에만 닫기
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        closeOverlay();
      }
    };

    document.addEventListener('mousedown', mouseDown);   // 외부 클릭 이벤트 리스너 등록
    return () => {
      document.removeEventListener('mousedown', mouseDown);  // 컴포넌트 언마운트 시 리스너 제거
    };
  }, []);   // 마운트 시 1회 실행

  return (
    <>
      <img
        src={robotImage}
        alt="로봇 이미지"
        className="chatbot-logo"
        onClick={ toggleChat }
      />
      {showChat && (
        <>
          <div className="overlay" onClick={closeOverlay}></div>
          <div ref={chatRef} className="chatbot-window">
            <span className="close-button" onClick={closeChat}>
              X
            </span>
            <MicRecord />
          </div>
        </>
      )}
    </>
  );
}

export default Chatbot;