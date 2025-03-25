import React, { useState } from "react";
import './signUpId.css';
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignUpId() {

  const [passwordVisible, setPasswordVisible] = useState(false);  //비밀번호 보임 상태 관리하는 state
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const [userPwd, setUserPwd] = useState('');
  const [confirmUserPwd, setConfirmUserPwd] = useState('');
  const [userIdError, setUserIdError] = useState('');
  const [userPwdError, setUserPwdError] = useState('');
  const [confirmUserPwdError, setConfirmUserPwdError] = useState('');

  // 비밀번호 보이기/숨기기 기능을 토글하는 함수
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const navigate = useNavigate();

  // 폼 제출 시 실행되는 함수
  const signUpSubmit = (event) => {
    event.preventDefault();

    let isValid = true;
    
    // 아이디 유효성 검사
    const userIdRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!userIdRegex.test(userId)) {
      setUserIdError("4~20자의 영문/숫자를 조합해주세요.");
      isValid = false;
    } else {
      setUserIdError("");
    }

    // 비밀번호 유효성 검사
    const userPwdRegex = /^[a-zA-Z0-9]{5,}$/;
    if (!userPwdRegex.test(userPwd)) {
      setUserPwdError("5자 이상의 영문/숫자를 조합해주세요.");
      isValid = false;
    } else {
      setUserPwdError("");
    }

    // 비밀번호 확인 유효성 검사
    if (userPwd !== confirmUserPwd) {
      setConfirmUserPwdError("비밀번호가 일치하지 않습니다.");
      isValid = false;
    } else {
      setConfirmUserPwdError("");
    }

    // 여기에 로그인 처리 로직 추가
    if (isValid) {
      console.log("ID : ", userId);
      console.log("PWD : ", userPwd);
      navigate("/");
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>아이디/비밀번호</h2>
        <p className="signup-des">티코에서 사용할 아이디와 비밀번호를 입력해주세요.</p>

        {/* 진행 상황 표시하는 프로그래스 바 */}
        <div className="progress-bar">
          <div className="progress-step">1</div>
          <div className="progress-stepLine">---</div>
          <div className="progress-step active">2</div>
          <div className="progress-stepLine">---</div>
          <div className="progress-step">3</div>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={signUpSubmit}>

          {/* 입력 필드 */}
          <div className="input-group">
            <label htmlFor="userId" className="input-label">아이디 (필수)</label>
            <input 
              type="text" 
              id="userId" 
              className="input-field" 
              placeholder="4~20자의 영문/숫자를 조합해주세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            {userIdError && <p className="error-message">{userIdError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">비밀번호 (필수)</label>
            <input 
              type={passwordVisible ? 'text' : 'password'} 
              id="password" 
              className="input-field" 
              placeholder="5자 이상의 영문/숫자를 조합해주세요" 
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
            {userPwdError && <p className="error-message">{userPwdError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">비밀번호 확인 (필수)</label>
            <input 
              type= {confirmPasswordVisible ? 'text' : 'password'}
              id="confirmPassword" 
              className="input-field" 
              placeholder="비밀번호를 한 번 더 입력해주세요."
              value={confirmUserPwd}
              onChange={(e) => setConfirmUserPwd(e.target.value)}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={confirmPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
            {confirmUserPwdError && <p className="error-message">{confirmUserPwdError}</p>}
          </div>

          <div className="button-group">
            <Link to="/signUp">
              <button className="prev-button">이전</button>
            </Link>

            
            <button className="next-button" onClick={signUpSubmit}>다음</button>
            
          </div>
       </form>
      </div>
  </div>
  )
}

export default SignUpId;