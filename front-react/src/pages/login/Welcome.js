import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  const handleNext = () => {
    // 메인 화면으로 이동 (메인 라우트가 "/"라고 가정)
    navigate("/");
  };

  return (
    <div className="join-welcome-container">
      <div className="welcome-box">
        <h1>환영합니다</h1>
        <p>
          코딩 학습을 주도하는 TICO 입니다.<br />
          TICO와 함께 즐거운 코디을 시작해볼까요?
        </p>
        <button onClick={handleNext} className="welcome-next-button">다음</button>
      </div>
    </div>
  );
}

export default Welcome;
