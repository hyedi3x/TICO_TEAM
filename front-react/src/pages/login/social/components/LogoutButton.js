// components/LogoutButton.js
import React from 'react';
import { logoutFromKakao, logoutFromNaver } from "../services/authService";

const LogoutButton = ({ onLogout }) => {
  
  const handleLogout = async () => {
    await logoutFromKakao(); // 카카오 로그아웃 실행
    await logoutFromNaver(); // 네이버 로그아웃 실행
    onLogout(); // 상태 초기화
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        backgroundColor: '#FEE500',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '5px',
        fontWeight: 'bold',
      }}
    >
      로그아웃
    </button>
  );
};

export default LogoutButton;
