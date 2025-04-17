import React, { useState, useEffect } from "react";
import './login.css';
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../login/social/utils/axiosInstance";

function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태를 저장합니다. (로그인 되었으면 true, 아니면 false)
  const [userInfo, setUserInfo] = useState(null); // 로그인한 사용자의 정보를 저장합니다. (예: 이메일, 닉네임)
  const [loginId, setLoginId] = useState("");
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
    e.preventDefault(); // 로그인 버튼 클릭 시 디폴트로 페이지 새로고침 막아주는 기능
    try {
      console.log("로그인 요청 ID:", loginId);
      let endpoint = "";
      let payload = {};
      // 입력값에 '@'가 있으면 고객 로그인, 없으면 사원 로그인으로 분기
      if (loginId.includes("@")) {
        endpoint = "/auth/login/customer";
        payload = { email: loginId, password };
      } else {
        endpoint = "/auth/login/employee";
        // 사원 로그인은 EmpDTO에 정의된 필드명 사용 (empId, empPassword)
        payload = { empId: loginId, empPwd: password };
      }

      const response = await axiosInstance.post(endpoint, payload);
      const { accessToken, refreshToken, user_uuid, nickname } = response.data;

      console.log("로그인 성공, 토큰 저장:", accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("autoLogin", "true");
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("user_uuid", user_uuid); 

      setIsLoggedIn(true);
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);

      // 로그인 실패 시, 관련 토큰 및 플래그 제거 안하면 500 error 발생
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("autoLogin");
      localStorage.removeItem("user_uuid"); 

    if (error.response?.status === 401) {
      alert("로그인 실패. 이메일 또는 비밀번호가 잘못되었습니다.");
    } else if (error.response?.status === 404) {
      alert("존재하지 않는 사용자입니다.");
    } else {
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
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
        localStorage.removeItem("nickname");
        localStorage.removeItem("autoLogin");

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
  
        if (error.response?.status === 401) {
          alert("이미 로그아웃된 상태입니다.");
        } else if (error.response?.status === 500) {
          alert("서버 오류로 로그아웃에 실패했습니다.");
        } else {
          alert("로그아웃 처리 중 문제가 발생했습니다.");
        }
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
                  type="text"
                  className="styled-input"
                  placeholder="이메일 또는 사원번호"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
              />
              <input
                  type="password"
                  className="styled-input"
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
              <Link to="/FindIdPassword">아이디 / 비밀번호 찾기</Link>
              <Link to="/signUp">회원가입 하기</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
