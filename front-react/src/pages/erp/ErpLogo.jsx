import React from "react";
import { useNavigate } from "react-router-dom";
import erpImage from "../../imgs/erp.png";

// visible: 부모 컴포넌트(Main.jsx)에서 전달받은 boolean 값, visible이 true일 때만 로고를 화면에 출력
function ErpLogo({ visible = false }) {
  const navigate = useNavigate();  // 리액트 라우터에서 페이지 이동을 위한 함수

  if (!visible) return null; // visible이 false면 아무것도 렌더링하지 않음

  // visible이 true면 ERP 로고 이미지로 변경 →  로고 클릭 시 "/erpMain" 페이지로 이동
  return (
    <img
      src={erpImage}
      alt="ERP 로고"
      className="chatbot-logo"
      onClick={() => navigate("/erpMain")}
      style={{ cursor: "pointer" }}
    />
  );
}

export default ErpLogo;
