import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate(); // 다른 페이지로 이동할때 사용(라다이렉트)
  const location = useLocation(); // 현재 url에 대한 정보를 가져옴

  useEffect(() => {
    const params = new URLSearchParams(location.search); 
    // 현재 url에 존재하는 accessToken, refreshToken 쿼리 스트링이 있다면 쉽게 읽을 수 있게 해줌
    const accessToken = params.get('accessToken'); // url에 포함된 accessToken 가져옴
    const refreshToken = params.get('refreshToken'); // url에 포함된 refreshToken 가져옴
    const user_uuid = params.get("user_uuid");
    if (!accessToken || !refreshToken) {
      console.error('JWT 토큰이 없음');
      navigate('/login');
      return;
      // if 문을 사용해서 토큰값이 하나도 없다면 jst 토큰 없음 console에 표출하고 있으면 login으로 화면이동
    }

    // JWT 토큰을 로컬스토리지에 저장
    // localStorage는 브라우저에 값을 저장할 수 있는 곳이고, 토큰값들을 저장해서 나중에 api 호출시 사용
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user_uuid', user_uuid);
    localStorage.setItem('autoLogin', 'true'); // autoLogin은 나중에 자동 로그인 여부를 판단하기위함

    // 메인 페이지로 이동 → Header.jsx useEffect가 /auth/user 조회
    navigate('/'); 
  }, [navigate, location]); // 의존성 배열이라 하며, navigate, location이 바뀔때마다 코드가 실행된다의 의미

  return <div>로그인 처리 중...</div>;
}

export default Callback; //  코드를 다른 파일에서 import를 통해 사용할 수 있게 함
