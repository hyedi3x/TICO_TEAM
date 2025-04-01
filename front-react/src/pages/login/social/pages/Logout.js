import React from "react";
import axios from "axios";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        console.error("토큰이 없음");
        return;
      }

      // 1. 백엔드에 로그아웃 요청
      const response = await axios.post("http://localhost:8081/api/kakao/unlink", null, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("로그아웃 응답 : ", response.data); // 로그아웃 응답로그

       // 2. 로컬 스토리지에서 토큰 삭제
       localStorage.removeItem("access_token");
       localStorage.removeItem("refresh_token");
       localStorage.removeItem("nickname");

      // 3. 로그인 페이지로 이동
      window.location.href = "/login";
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;
