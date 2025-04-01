import React, { useState, useEffect } from "react";
import './login.css';
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../login/social/utils/axiosInstance";

function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedAutoLogin = localStorage.getItem("autoLogin") === "true";
    const accessToken = localStorage.getItem("accessToken");

    console.log("초기 accessToken:", accessToken);

    if (savedAutoLogin && accessToken) {
      setIsLoggedIn(true);
      axiosInstance.get("/auth/user")
        .then((response) => {
          console.log("사용자 정보 조회 성공:", response.data);
          setUserInfo(response.data);
        })
        .catch((error) => {
          console.error("사용자 정보 조회 실패:", error);
          localStorage.clear();
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("로그인 요청:", email);
      const response = await axiosInstance.post("/auth/login", { email, password });

      const { accessToken, refreshToken } = response.data;
      console.log("로그인 성공, 토큰 저장:", accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("autoLogin", "true");

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
        console.log("로그아웃 성공");
        localStorage.clear();
        setIsLoggedIn(false);
        setUserInfo(null);
        navigate("/login");
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
            <form className="login-form" onSubmit={handleLogin}>
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
              <button type="submit" className="login-button">로그인</button>
            </form>

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
