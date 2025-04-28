// src/pages/SignUpId.jsx
import React, { useState, useEffect } from "react";
import "./signUpId.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "./social/utils/axiosInstance";
import { getFourteenYearsAgoBoundary } from "./social/utils/dateUtils";

export default function SignUpId() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    ageGroup,
    name: certName,
    birth: certBirth,
    phone: certPhone,
    parentPhone: certParentPhone,
  } = location.state || {};

  // 이메일 앞/뒤
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  // ---- 새로 추가 ----
  const [verifyingEmail, setVerifyingEmail] = useState("");

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeError, setEmailCodeError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [userName, setUserName] = useState(certName || "");
  const [birthDate, setBirthDate] = useState(certBirth || "");

  const initialPhone = ageGroup === "over14" ? certPhone || "" : "";
  const [phone, setPhone] = useState(initialPhone);

  const [nickname, setNickname] = useState("");
  const [userPwd, setUserPwd] = useState("");
  const [confirmUserPwd, setConfirmUserPwd] = useState("");

  const [emailError, setEmailError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [userPwdError, setUserPwdError] = useState("");
  const [confirmUserPwdError, setConfirmUserPwdError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(v => !v);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(v => !v);

  const validateEmail = (email) =>
    /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(email);

  const validateBirthDate = () => {
    const boundary = new Date(getFourteenYearsAgoBoundary());
    const birth = new Date(birthDate);
    if (ageGroup === "under14" && birth <= boundary) {
      setBirthDateError("14세 미만만 가입 가능합니다.");
      return false;
    }
    if (ageGroup === "over14" && birth > boundary) {
      setBirthDateError("14세 이상만 가입 가능합니다.");
      return false;
    }
    setBirthDateError("");
    return true;
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // 1) 인증 코드 발송
  const sendRegisterCode = async () => {
    const fullEmail = `${emailLocal}@${emailDomain}`;
    if (!validateEmail(fullEmail)) {
      alert("유효한 이메일을 입력해주세요.");
      return;
    }
    try {
      await axiosInstance.post("/auth/send-register-code", { email: fullEmail });
      setIsEmailSent(true);
      setVerifyingEmail(fullEmail);    // 발송 시점 이메일 고정
      setEmailCode("");
      setIsEmailVerified(false);
      setResendTimer(60);
      alert("인증 코드를 이메일로 발송했습니다.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "인증 코드 발송에 실패했습니다.");
    }
  };

  // 2) 인증 코드 확인
  const verifyRegisterCode = async () => {
    try {
      await axiosInstance.post("/auth/verify-register-code", {
        email: verifyingEmail,       // 고정된 이메일로 검증
        code: emailCode,
      });
      setIsEmailVerified(true);
      setEmailCodeError("");
      alert("이메일 인증이 완료되었습니다.");
    } catch (err) {
      console.error(err);
      setEmailCodeError("인증 코드가 올바르지 않거나 만료되었습니다.");
    }
  };

  // 3) 회원가입
  const signUpSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      alert("이메일 본인인증을 먼저 완료해주세요.");
      return;
    }

    let valid = true;
    const fullEmail = verifyingEmail; // 검증된 이메일 사용

    if (!validateBirthDate()) return;
    if (!validateEmail(fullEmail)) {
      setEmailError("유효한 이메일 형식을 입력해주세요.");
      valid = false;
    } else setEmailError("");

    if (!userName.trim()) {
      setUserNameError("이름을 입력해주세요.");
      valid = false;
    } else setUserNameError("");

    if (!birthDate) {
      setBirthDateError("생년월일을 입력해주세요");
      valid = false;
    }

    if (!phone.trim()) {
      setPhoneError("전화번호를 입력해주세요.");
      valid = false;
    } else setPhoneError("");

    if (!nickname.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      valid = false;
    } else setNicknameError("");

    if (!/^[a-zA-Z0-9]{5,}$/.test(userPwd)) {
      setUserPwdError("5자 이상의 영문/숫자를 조합해주세요.");
      valid = false;
    } else setUserPwdError("");

    if (userPwd !== confirmUserPwd) {
      setConfirmUserPwdError("비밀번호가 일치하지 않습니다.");
      valid = false;
    } else setConfirmUserPwdError("");

    if (!valid) return;
    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/register", {
        email: fullEmail,
        password: userPwd,
        name: userName,
        birthDate: birthDate.slice(0, 10),
        phone,
        nickname,
      });
      navigate("/welcome");
    } catch (err) {
      console.error("회원가입 실패:", err);
      alert(err.response?.data || "회원가입에 실패했습니다.");
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
        <p className="signup-des">
          티코에서 사용할 이메일과 비밀번호를 입력해주세요.
        </p>
        <div className="progress-bar">
          <div className="progress-step">1</div>
          <div className="progress-stepLine">---</div>
          <div className="progress-step active">2</div>
          <div className="progress-stepLine">---</div>
          <div className="progress-step">3</div>
        </div>

        <form onSubmit={signUpSubmit}>
          {/* 이메일 입력 */}
          <div className="input-group">
            <label htmlFor="emailLocal">이메일 (필수)</label>
            <div className="email-wrapper">
              <input
                id="emailLocal"
                className="email-local"
                placeholder="이메일 앞자리"
                value={emailLocal}
                onChange={e => setEmailLocal(e.target.value)}
                disabled={isEmailSent}
              />
              <span className="at-symbol">@</span>
              <select
                value={emailDomain}
                onChange={e => setEmailDomain(e.target.value)}
                disabled={isEmailSent}
                className="email-domain"
              >
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="daum.net">daum.net</option>
                <option value="hotmail.com">hotmail.com</option>
              </select>
              <button
                type="button"
                className="email-verify-button"
                onClick={sendRegisterCode}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0
                  ? `${resendTimer}초 후 재전송`
                  : isEmailSent
                  ? "재전송"
                  : "인증 코드 발송"}
              </button>
            </div>
            {emailError && <p className="error-message">{emailError}</p>}
          </div>

          {/* 코드 입력 */}
          {isEmailSent && !isEmailVerified && (
            <div className="input-group">
              <label htmlFor="emailCode">인증 코드 입력</label>
              <div className="email-code-wrapper">
                <input
                  id="emailCode"
                  className="input-field"
                  placeholder="이메일로 받은 인증코드를 입력하세요."
                  value={emailCode}
                  onChange={e => setEmailCode(e.target.value)}
                />
                <button
                  type="button"
                  className="verify-code-button"
                  onClick={verifyRegisterCode}
                >
                  코드 인증
                </button>
              </div>
              {emailCodeError && (
                <p className="error-message">{emailCodeError}</p>
              )}
            </div>
          )}
          {isEmailVerified && (
            <p className="success-message">이메일 인증이 완료되었습니다.</p>
          )}

          {/* 비밀번호 */}
          <div className="input-group">
            <label htmlFor="password">비밀번호 (필수)</label>
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
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
              type={confirmPasswordVisible ? "text" : "password"}
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
            {confirmUserPwdError && (
              <p className="error-message">{confirmUserPwdError}</p>
            )}
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
              min={ageGroup === "under14" ? getFourteenYearsAgoBoundary() : undefined}
              max={ageGroup === "under14" ? undefined : getFourteenYearsAgoBoundary()}
            />
            {birthDateError && (
              <p className="error-message">{birthDateError}</p>
            )}
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
            {nicknameError && (
              <p className="error-message">{nicknameError}</p>
            )}
          </div>

          <div className="button-group">
            <Link to="/cert">
              <button type="button" className="prev-button">
                이전
              </button>
            </Link>
            <button
              type="submit"
              className="next-button"
              disabled={!isEmailVerified}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
