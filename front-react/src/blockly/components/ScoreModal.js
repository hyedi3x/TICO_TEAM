import React, { useEffect, useRef } from "react";
import "./ScoreModal.css";

const ScoreModal = ({ score, onClose, onRetry }) => {
  // ESC 키로도 닫을 수 있게 (선택)
  const boxRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="score-modal-overlay" onClick={onClose}>
      <div
        ref={boxRef}
        className="score-modal-box fadeInUp"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 className="score-modal-title">게임 결과</h2>
        <div className="score-modal-content">
          <span className="score-modal-label">현재 점수</span>
          <div className="score-modal-score">{score}</div>
        </div>
        <div className="score-modal-buttons">
          <button className="score-modal-btn exit" onClick={onClose}>
            나가기
          </button>
          <button className="score-modal-btn retry" onClick={onRetry}>
            다시하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;
