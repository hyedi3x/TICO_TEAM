import React, { useState } from "react";
import './login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from "react-router-dom";

function Login(){

  const [passwordVisible, setPasswordVisible] = useState(false);  //비밀번호 보임 상태 관리하는 state
  const [userId, setUserId] = useState('');
  const [userPwd, setUserPwd] = useState('');

  // 비밀번호 보이기/숨기기 기능을 토글하는 함수
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // 폼 제출 시 실행되는 함수
  const loginSubmit = (event) => {
    event.preventDefault(); // 폼 제출 시 페이지가 새로 고침 되는 것을 방지.
    //여기에 로그인 처리 로직 추가
    console.log("ID : ", userId);
    console.log("PWD : ", userPwd);
  } 

  return(
     <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>

        {/* 로그인 폼 */}
        <form onSubmit={loginSubmit}>

          {/* 아이디 입력 필드 */}
          <div className="input-group">
            <label htmlFor="id">아이디 입력</label> {/* htmlFor는 label 태그와 입력 필드를 연결하는 속성. 입력 필드의 id와 일치 */}
            <input 
              type="text" 
              id="id" 
              placeholder="아이디를 입력해 주세요."
              value={userId}
              onChange={(e) => setUserId(e.target.value)} 
              />
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="input-group">
            <label htmlFor="password">비밀번호 입력</label>
              <input
                type={passwordVisible ? 'text' : 'password'} 
                id="password"
                placeholder="비밀번호를 입력해 주세요."
                value={userPwd}
                onChange={(e) => setUserPwd(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}  // 버튼 클릭 시 togglePasswordVisibility 함수가 호출되어 비밀번호 보임 상태를 토글
                aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}  //문자열을 통해 현재 엘리먼트의 기능과 목적을 설명
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye /> } {/* 아이콘을 조건에 따라 표시 (숨길 때 eye-slash, 비밀번호 보일 때 eye) */}
              </button>
          </div>

          {/* 체크박스 그룹 */}
          <div className="checkbox-group">
            <label>
            <input type="checkbox" className="check_btn"/> 
              아이디 저장
            </label>
            
            <label>
            <input type="checkbox" className="check_btn"/> 
              자동 로그인
            </label>
          </div>
          <Link to='/'>
            <button className="login-button">아이디로 로그인</button>
          </Link>
        </form>

        {/* 로그인 버튼 */}
        <div className="social-login">
          <Link to='/'>
            <button className="social-button naver">네이버로 로그인</button>
          </Link>
          <Link to='/'>
            <button className="social-button kakao">카카오로 로그인</button>
          </Link>
          <Link to='/'>
            <button className="social-button google">구글로 로그인</button>
          </Link>
        </div>
        
        {/* 로그인 하단 링크 */}
        <div className="login-footer">
          <Link to="/find-id-password">아이디 / 비밀번호 찾기</Link>
          <Link to="/signUp">회원가입 하기</Link>
        </div>
      </div>
    </div>
  )
}

export default Login;