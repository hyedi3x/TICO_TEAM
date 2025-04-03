import React, { useState, useEffect } from "react";
import './login.css';
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../login/social/utils/axiosInstance";

function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 저장합니다. (로그인 되었으면 true, 아니면 false)
  const [userInfo, setUserInfo] = useState(null); // 로그인한 사용자의 정보를 저장합니다. (예: 이메일, 닉네임)
  const [email, setEmail] = useState(""); // 로그인 폼에 입력하는 이메일 저장
  const [password, setPassword] = useState(""); // 로그인 폼에 입력하는 비밀번호 저장
  const navigate = useNavigate();

  useEffect(() => {
    const savedAutoLogin = localStorage.getItem("autoLogin") === "true";
    const accessToken = localStorage.getItem("accessToken");

    console.log("초기 accessToken:", accessToken);

    if (savedAutoLogin && accessToken) {
      setIsLoggedIn(true);
      axiosInstance.get("/auth/user")
        .then((response) => {
          setUserInfo(response.data);
        })
        .catch((error) => {
          console.error("사용자 정보 조회 실패:", error);
          localStorage.clear();
          setIsLoggedIn(false);
        });
    }
    // 컴포넌트가 처음 렌더링될 때 한 번 실행되어 로컬스토리지에 저장된 accessToken과 autoLogin 정보를 확인
    
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("baseURL:", axiosInstance.defaults.baseURL);
      console.log("로그인 요청:", email);
      const response = await axiosInstance.post("/auth/login", { email, password });

      const { accessToken, refreshToken, user_uuid } = response.data;
      console.log("로그인 성공, 토큰 저장:", accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("autoLogin", "true");
      localStorage.setItem("user_uuid", user_uuid); 

      setIsLoggedIn(true);
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인 실패. 이메일 또는 비밀번호를 확인하세요.");
    }
  };

  const handleSocialLogin = (provider) => {
    const url = `http://localhost:8081/oauth2/authorization/${provider}?flow=login`;
    console.log("소셜 로그인 이동 URL:", url);
    window.location.href = url;
  };

  const handleLogout = () => {
    axiosInstance.post("/auth/logout")
      .then(() => {
        alert("로그아웃 성공");

        localStorage.clear(); // : clear()가 호출되기 전에 어떤 비동기 작업이 남아 있거나, 특정 로직이 꼬이면 값이 완전히 지워지지 않을 수 있음
        // localStorage.clear으로 명확하게 제거 

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.claerItem("autoLogin");

        // 로그아웃 처리 상태 저장 (리렌더링을 막기 위한 상태)
        sessionStorage.setItem("loggedOut", "true");

        setIsLoggedIn(false);
        setUserInfo(null);
  
        console.log('accessToken:', localStorage.getItem("accessToken"));
        console.log('user_uuid:', localStorage.getItem("user_uuid"));
        console.log('autoLogin:', localStorage.getItem("autoLogin"));
          
        // navigate를 약간 지연시켜서 alert 먼저 보이게 함
        setTimeout(() => {
          navigate("/login");
        }, 100); // 0.1초 딜레이
      })
      .catch((error) => {
        console.error("로그아웃 실패:", error);
        alert("로그아웃 실패");
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLoggedIn ? "환영합니다!" : "로그인"}</h2>

        {isLoggedIn ? (
          <div className="user-info">
            <p>이메일: {userInfo?.email}</p>
            <p>닉네임: {userInfo?.nickname}</p>
            <button className="logout-button" onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          <>
            <div className="login-form">
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="login-button" onClick={handleLogin}>로그인</button>
            </div>

            <div className="social-login">
              <button className="social-button naver" onClick={() => handleSocialLogin("naver")}>
                네이버로 로그인
              </button>
              <button className="social-button kakao" onClick={() => handleSocialLogin("kakao")}>
                카카오로 로그인
              </button>
              <button className="social-button google" onClick={() => handleSocialLogin("google")}>
                구글로 로그인
              </button>
            </div>

            <div className="login-footer">
              <Link to="/find-id-password">아이디 / 비밀번호 찾기</Link>
              <Link to="/signUp">회원가입 하기</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
