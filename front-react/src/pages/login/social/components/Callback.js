import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      console.error('JWT 토큰이 없음');
      navigate('/login');
      return;
    }

    // JWT 토큰을 로컬스토리지에 저장
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('autoLogin', 'true'); // 필요시

    // 메인 페이지로 이동 → Header.jsx useEffect가 /auth/user 조회
    navigate('/');
  }, [navigate, location]);

  return <div>로그인 처리 중...</div>;
}

export default Callback;
