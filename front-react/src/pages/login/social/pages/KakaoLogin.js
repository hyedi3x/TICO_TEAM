// pages/KakaoLogin.js
// 카카오 인증 후 리다이렉트되어 인증 코드를 처리하는 페이지

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KakaoLogin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const getToken = async () => {
            const code = new URL(window.location.href).searchParams.get('code');
            console.log('Authorization Code:', code);
            if (!code) {
                alert('카카오 인증 코드가 없습니다.');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.post(
                    'http://localhost:8081/api/kakao/callback',
                    { code },
                    {
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                        },
                    }
                );

                const { access_token, refresh_token, nickname } = response.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
                localStorage.setItem('nickname', nickname);
                navigate('/');
            } catch (error) {
                console.error('카카오 로그인 실패:', error);
                alert('로그인에 실패했습니다.');
                navigate('/login');
            }
        };

        getToken();
    }, [navigate]);

    return <p>로그인 처리 중...</p>;
};

export default KakaoLogin;

// useEffect로 컴포넌트 마운트 시 URL에서 인증 코드(code) 추출
// axios.post로 백엔드에 인증 코드 전달
// 백엔드에서 반환된 토큰과 닉네임을 localStorage에 저장
// 성공 시 /boardList로 이동, 실패 시 /loginform으로 이동