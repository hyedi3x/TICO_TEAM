// components/LoginButton.js
// 카카오 로그인 버튼
import React from 'react';
import KAKAO_AUTH_URL from '../utils/KakaoAuth';

const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
    };

    return (
        <button
            onClick={handleLogin}
            style={{
                backgroundColor: '#FEE500',
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: 'bold',
            }}
        >
            카카오 로그인
        </button>

    );
};

export default LoginButton;

// 버튼 클릭 시 KAKAO_AUTH_URL로 리다이렉트
