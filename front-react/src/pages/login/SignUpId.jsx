// src/pages/SignUpId.jsx
import React, { useState } from "react";
import './signUpId.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';

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
      await axios.post("http://localhost:8081/auth/register", {
        email: fullEmail,
        password: userPwd,
        name: userName,
        birthDate: birthDate,
        phone: phone,
        nickname: nickname
      });
      navigate("/welcome");
    } catch (err) {
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



// import React, {useState} from "react";
// import './signUpId.css';
// import { Link, useNavigate } from "react-router-dom";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import axios from 'axios';

// function SignUpId() {
//   // 비밀번호 보임 상태
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
//   // 이메일 입력: 앞자리와 도메인
//   const [emailLocal, setEmailLocal] = useState('');
//   const [emailDomain, setEmailDomain] = useState('gmail.com'); // 기본 도메인 설정 (원하는 값으로 수정 가능)
  
//   // 추가 입력 필드: 이름, 생년월일, 전화번호, 닉네임
//   const [userName, setUserName] = useState('');
//   const [birthDate , setBirthDate] = useState('');
//   const [phone, setPhone] = useState('');
//   const [nickname, setNickname] = useState('');
  
//   // 비밀번호 및 확인
//   const [userPwd, setUserPwd] = useState('');
//   const [confirmUserPwd, setConfirmUserPwd] = useState('');
  
//   // 에러 메시지 상태
//   const [emailError, setEmailError] = useState('');
//   const [birthDateError, setBirthDateErrorr] = useState('');
//   const [userNameError, setUserNameError] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [nicknameError, setNicknameError] = useState('');
//   const [userPwdError, setUserPwdError] = useState('');
//   const [confirmUserPwdError, setConfirmUserPwdError] = useState('');
  
//   // 로딩 상태 추가
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();

//   const togglePasswordVisibility = () => {
//     setPasswordVisible(!passwordVisible);
//   };

//   const toggleConfirmPasswordVisibility = () => {
//     setConfirmPasswordVisible(!confirmPasswordVisible);
//   };

//   // 전체 이메일 주소를 조합하여 검증 (일반적으로 사용되는 정규표현식)
//   const validateEmail = (email) => {
//     const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
//     return emailRegex.test(email);
//   }

//   const signUpSubmit = async (event) => {
//     event.preventDefault();
//     let isValid = true;

//     const fullEmail = `${emailLocal}@${emailDomain}`;

//     // 이메일 유효성 검사
//     if (!validateEmail(fullEmail)) {
//       setEmailError("유효한 이메일 형식을 입력해주세요.");
//       isValid = false;
//     } else {
//       setEmailError("");
//     }

//     // 이름 필수 체크
//     if (!userName.trim()) {
//       setUserNameError("이름을 입력해주세요.");
//       isValid = false;
//     } else {
//       setUserNameError("");
//     }

//     // 전화번호 필수 체크
//     if (!phone.trim()) {
//       setPhoneError("전화번호를 입력해주세요.");
//       isValid = false;
//     } else {
//       setPhoneError("");
//     }

//     // 닉네임 필수 체크
//     if (!nickname.trim()) {
//       setNicknameError("닉네임을 입력해주세요.");
//       isValid = false;
//     } else {
//       setNicknameError("");
//     }

//     // 비밀번호 유효성 검사 (5자 이상의 영문/숫자)
//     const userPwdRegex = /^[a-zA-Z0-9]{5,}$/;
//     if (!userPwdRegex.test(userPwd)) {
//       setUserPwdError("5자 이상의 영문/숫자를 조합해주세요.");
//       isValid = false;
//     } else {
//       setUserPwdError("");
//     }

//     // 비밀번호 확인 검사
//     if (userPwd !== confirmUserPwd) {
//       setConfirmUserPwdError("비밀번호가 일치하지 않습니다.");
//       isValid = false;
//     } else {
//       setConfirmUserPwdError("");
//     }

//     if (isValid) {
//       // 요청 시작 전에 로딩 상태 true로 설정
//       setIsLoading(true);
//       try {
//         const response = await axios.post("http://localhost:8081/auth/register", {
//           email: fullEmail,
//           password: userPwd,
//           name: userName,
//           phone: phone,
//           nickname: nickname
//         });
//         console.log("회원가입 성공:", response.data);
//         navigate("/welcome"); 
//       } catch (error) {
//         console.error("회원가입 실패:", error.response ? error.response.data : error);
//         alert("회원가입에 실패했습니다: " + (error.response ? error.response.data : ""));
//         // 에러 발생 시 로딩 상태 해제
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="signup-container">
//       {isLoading && (
//         <div className="loading-overlay">
//           <p>잠시만 기다려주세요...</p>
//         </div>
//       )}
//       <div className="signup-box">
//         <h2>이메일/비밀번호</h2>
//         <p className="signup-des">티코에서 사용할 이메일과 비밀번호를 입력해주세요.</p>

//         <div className="progress-bar">
//           <div className="progress-step">1</div>
//           <div className="progress-stepLine">---</div>
//           <div className="progress-step active">2</div>
//           <div className="progress-stepLine">---</div>
//           <div className="progress-step">3</div>
//         </div>

//         <form onSubmit={signUpSubmit}>
//           {/* 이메일 입력란: 앞자리와 도메인 선택 */}
//           <div className="input-group">
//             <label htmlFor="emailLocal" className="input-label">이메일 (필수)</label>
//             <div className="email-wrapper">
//               <input 
//                 type="text"
//                 id="emailLocal"
//                 className="email-local"   // 여기!
//                 placeholder="이메일 앞자리"
//                 value={emailLocal}
//                 onChange={(e) => setEmailLocal(e.target.value)}
//               />
//               <span className="at-symbol">@</span>
//               <select 
//                 value={emailDomain}
//                 onChange={(e) => setEmailDomain(e.target.value)}
//                 className="email-domain"  // 여기!
//               >
//                 <option value="gmail.com">gmail.com</option>
//                 <option value="naver.com">naver.com</option>
//                 <option value="daum.net">daum.net</option>
//                 <option value="hotmail.com">hotmail.com</option>
//               </select>
//             </div>
//             {emailError && <p className="error-message">{emailError}</p>}
//           </div>

//           {/* 비밀번호 입력란 */}
//           <div className="input-group">
//             <label htmlFor="password" className="input-label">비밀번호 (필수)</label>
//             <input 
//               type={passwordVisible ? 'text' : 'password'}
//               id="password"
//               className="input-field"
//               placeholder="5자 이상의 영문/숫자를 조합해주세요"
//               value={userPwd}
//               onChange={(e) => setUserPwd(e.target.value)}
//             />
//             <button
//               type="button"
//               className="password-toggle"
//               onClick={togglePasswordVisibility}
//               aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
//             >
//               {passwordVisible ? <FaEyeSlash /> : <FaEye />}
//             </button>
//             {userPwdError && <p className="error-message">{userPwdError}</p>}
//           </div>

//           {/* 비밀번호 확인 입력란 */}
//           <div className="input-group">
//             <label htmlFor="confirmPassword" className="input-label">비밀번호 확인 (필수)</label>
//             <input 
//               type={confirmPasswordVisible ? 'text' : 'password'}
//               id="confirmPassword"
//               className="input-field"
//               placeholder="비밀번호를 한 번 더 입력해주세요."
//               value={confirmUserPwd}
//               onChange={(e) => setConfirmUserPwd(e.target.value)}
//             />
//             <button
//               type="button"
//               className="password-toggle"
//               onClick={toggleConfirmPasswordVisibility}
//               aria-label={confirmPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
//             >
//               {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
//             </button>
//             {confirmUserPwdError && <p className="error-message">{confirmUserPwdError}</p>}
//           </div>

//           {/* 이름 입력란 */}
//           <div className="input-group">
//             <label htmlFor="userName" className="input-label">이름 (필수)</label>
//             <input 
//               type="text"
//               id="userName"
//               className="input-field"
//               placeholder="이름을 입력해주세요."
//               value={userName}
//               onChange={(e) => setUserName(e.target.value)}
//             />
//             {userNameError && <p className="error-message">{userNameError}</p>}
//           </div>

//            {/* 생년월일 입력란 */}
//            <div className="input-group">
//             <label htmlFor="birthDate" className="input-label">생년월일 (필수)</label>
//             <input 
//               type="date"
//               id="birthDate"
//               className="input-field"
//               value={birthDate}
//               onChange={(e) => setBirthDate(e.target.value)}
//             />
//             {birthDateError && <p className="error-message">{birthDateError}</p>}
//           </div>

//           {/* 전화번호 입력란 */}
//           <div className="input-group">
//             <label htmlFor="phone" className="input-label">전화번호 (필수)</label>
//             <input 
//               type="text"
//               id="phone"
//               className="input-field"
//               placeholder="전화번호를 입력해주세요."
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//             {phoneError && <p className="error-message">{phoneError}</p>}
//           </div>

//           {/* 닉네임 입력란 */}
//           <div className="input-group">
//             <label htmlFor="nickname" className="input-label">닉네임 (필수)</label>
//             <input 
//               type="text"
//               id="nickname"
//               className="input-field"
//               placeholder="닉네임을 입력해주세요."
//               value={nickname}
//               onChange={(e) => setNickname(e.target.value)}
//             />
//             {nicknameError && <p className="error-message">{nicknameError}</p>}
//           </div>

//           <div className="button-group">
//             <Link to="/signUp">
//               <button className="prev-button" type="button">이전</button>
//             </Link>
//             <button className="next-button" type="submit">회원가입</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SignUpId;
