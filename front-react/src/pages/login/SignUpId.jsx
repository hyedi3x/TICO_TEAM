// src/pages/SignUpId.jsx
import React, { useState } from "react";
import './signUpId.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import axiosInstance from "./social/utils/axiosInstance";

export default function SignUpId() {
  const navigate = useNavigate();
  const location = useLocation();

  // Cert.jsx 에서 넘어온 값
  const {
    ageGroup,
    name: certName,
    birth: certBirth,
    phone: certPhone,
    parentPhone: certParentPhone
  } = location.state || {};

  // 비밀번호 보임 상태
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // 이메일 입력: 앞자리 + 도메인
  const [emailLocal, setEmailLocal]     = useState('');
  const [emailDomain, setEmailDomain]   = useState('gmail.com');
  
  // 이름 / 생년월일 / 전화번호 초기값: Cert에서 넘어온 값
  const [userName, setUserName]     = useState(certName      || '');
  const [birthDate, setBirthDate]   = useState(certBirth     || '');
  const [phone, setPhone]           = useState(
    // 14세 미만일 경우에는 회원가입 시 전화번호 직접입력
    ageGroup === 'under14'
      ? (certPhone       || '')
      : ' '
  );

  const [nickname, setNickname]     = useState('');
  const [userPwd, setUserPwd]       = useState('');
  const [confirmUserPwd, setConfirmUserPwd] = useState('');

  // 에러 메시지
  const [emailError, setEmailError]               = useState('');
  const [birthDateError, setBirthDateError]       = useState('');
  const [userNameError, setUserNameError]         = useState('');
  const [phoneError, setPhoneError]               = useState('');
  const [nicknameError, setNicknameError]         = useState('');
  const [userPwdError, setUserPwdError]           = useState('');
  const [confirmUserPwdError, setConfirmUserPwdError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(v => !v);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(v => !v);
  };

  const validateEmail = email => {
    const re = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
    return re.test(email);
  };

  const signUpSubmit = async e => {
    e.preventDefault();
    let valid = true;
    const fullEmail = `${emailLocal}@${emailDomain}`;

    // 이메일 검증
    if (!validateEmail(fullEmail)) {
      setEmailError("유효한 이메일 형식을 입력해주세요.");
      valid = false;
    } else setEmailError("");

    // 이름
    if (!userName.trim()) {
      setUserNameError("이름을 입력해주세요.");
      valid = false;
    } else setUserNameError("");

    // 생년월일
    if (!birthDate) {
      setBirthDateError("생년월일을 입력해주세요.");
      valid = false;
    } else setBirthDateError("");

    // 전화번호
    if (!phone.trim()) {
      setPhoneError("전화번호를 입력해주세요.");
      valid = false;
    } else setPhoneError("");

    // 닉네임
    if (!nickname.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      valid = false;
    } else setNicknameError("");

    // 비밀번호
    if (!/^[a-zA-Z0-9]{5,}$/.test(userPwd)) {
      setUserPwdError("5자 이상의 영문/숫자를 조합해주세요.");
      valid = false;
    } else setUserPwdError("");

    // 비밀번호 확인
    if (userPwd !== confirmUserPwd) {
      setConfirmUserPwdError("비밀번호가 일치하지 않습니다.");
      valid = false;
    } else setConfirmUserPwdError("");

    if (!valid) return;

    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/register', {
        email: fullEmail,
        password: userPwd,
        name: userName,
        birthDate: birthDate,
        phone: phone,
        nickname: nickname
      });
      navigate("/welcome");
    } catch (err) {

      // 백엔드에서 중복 닉네임일 때 409 + "이미 존재하는 닉네임입니다." 반환한다고 가정
      if (err.response?.status === 409 && typeof err.response.data === 'string') {
          const msg = err.response.data;
          if (msg.includes("닉네임")) {
          alert("현재 사용중인 닉네임 입니다. 다른 닉네임을 사용해주세요.");
          setIsLoading(false);
          return;
        }
      }

      console.error("회원가입 실패:", err);
      alert("회원가입에 실패했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {isLoading && (
        <div className="loading-overlay">
          <p>잠시만 기다려주세요...</p>
        </div>
      )}
      <div className="signup-box">
        <h2>이메일/비밀번호</h2>
        <p className="signup-des">티코에서 사용할 이메일과 비밀번호를 입력해주세요.</p>

        <div className="progress-bar">
          <div className="progress-step">1</div>
          <div className="progress-stepLine">---</div>
          <div className="progress-step active">2</div>
          <div className="progress-stepLine">---</div>
          <div className="progress-step">3</div>
        </div>

        <form onSubmit={signUpSubmit}>
          {/* 이메일 */}
          <div className="input-group">
            <label htmlFor="emailLocal">이메일 (필수)</label>
            <div className="email-wrapper">
              <input
                id="emailLocal"
                className="email-local"
                placeholder="이메일 앞자리"
                value={emailLocal}
                onChange={e => setEmailLocal(e.target.value)}
              />
              <span className="at-symbol">@</span>
              <select
                value={emailDomain}
                onChange={e => setEmailDomain(e.target.value)}
                className="email-domain"
              >
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="daum.net">daum.net</option>
                <option value="hotmail.com">hotmail.com</option>
              </select>
            </div>
            {emailError && <p className="error-message">{emailError}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <label htmlFor="password">비밀번호 (필수)</label>
            <input
              id="password"
              type={passwordVisible ? 'text' : 'password'}
              className="input-field"
              placeholder="5자 이상의 영문/숫자를 조합해주세요"
              value={userPwd}
              onChange={e => setUserPwd(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
            {userPwdError && <p className="error-message">{userPwdError}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인 (필수)</label>
            <input
              id="confirmPassword"
              type={confirmPasswordVisible ? 'text' : 'password'}
              className="input-field"
              placeholder="비밀번호를 한 번 더 입력해주세요."
              value={confirmUserPwd}
              onChange={e => setConfirmUserPwd(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={toggleConfirmPasswordVisibility}
            >
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
            {confirmUserPwdError && <p className="error-message">{confirmUserPwdError}</p>}
          </div>

          {/* 이름 */}
          <div className="input-group">
            <label htmlFor="userName">이름 (필수)</label>
            <input
              id="userName"
              type="text"
              className="input-field"
              placeholder="이름을 입력해주세요."
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
            {userNameError && <p className="error-message">{userNameError}</p>}
          </div>

          {/* 생년월일 */}
          <div className="input-group">
            <label htmlFor="birthDate">생년월일 (필수)</label>
            <input
              id="birthDate"
              type="date"
              className="input-field"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
            />
            {birthDateError && <p className="error-message">{birthDateError}</p>}
          </div>

          {/* 전화번호 */}
          <div className="input-group">
            <label htmlFor="phone">전화번호 (필수)</label>
            <input
              id="phone"
              type="text"
              className="input-field"
              placeholder="전화번호를 입력해주세요."
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            {phoneError && <p className="error-message">{phoneError}</p>}
          </div>


          {/* 닉네임 */}
          <div className="input-group">
            <label htmlFor="nickname">닉네임 (필수)</label>
            <input
              id="nickname"
              type="text"
              className="input-field"
              placeholder="닉네임을 입력해주세요."
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
            {nicknameError && <p className="error-message">{nicknameError}</p>}
          </div>

          <div className="button-group">
            <Link to="/cert">
              <button type="button" className="prev-button">이전</button>
            </Link>
            <button type="submit" className="next-button">회원가입</button>
          </div>
        </form>
      </div>
    </div>
  );
}

