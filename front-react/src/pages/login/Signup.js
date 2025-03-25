import React, { useState } from 'react';
import './Signup.css'
import { useNavigate } from 'react-router-dom';

function Signup() {

  const [termsAgree, setTermsAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅

  // 약관 및 개인정보 처리 방침 동의 유효성 검사를 위한 함수
  const validateAgreement = () => {
    if (!termsAgree && !privacyAgree){
      setErrorMessage('약관 및 개인정보 처리 방침에 동의해야 합니다.');
      return false;
    } else if (!termsAgree) {
      setErrorMessage('이용 약관에 동의해야 합니다.');
      return false;
    } else if (!privacyAgree){
      setErrorMessage('개인정보 처리 방침에 동의해야 합니다.');
      return false;
    }
    setErrorMessage('');  //유효성 검사 통과 시 오류 메시지 초기화
     return true;
    };

    // 회원가입 제출 버튼 클릭 시 호출되는 함수
    const signUpSubmit = (type) => (e) => {
      e.preventDefault();
      if(validateAgreement()){  //약관 동의 여부 유효성 검사
        // 동의 여부를 로컬 스토리지에 저장 (다음 페이지에서 참조 가능)
        localStorage.setItem('termsAgree', termsAgree);
        localStorage.setItem('privacyAgree', privacyAgree);

        // 약관 동의가 완료되면, 다음 페이지로 이동(회원가입 타입에 따라)
        navigate(`/signUp/${type}`); 
      }
    };

  return (
    <div className="welcome-container">
      <h1 className="welcome-title">티코에 오신 걸 환영해요</h1>
      <p className="welcome-message">먼저 이용 약관과 개인 정보 처리 방침을 확인해주세요.</p>

      {/* 진행 상황 표시하는 프로그래스 바 */}
      <div className="progress-bar">
        <div className="progress-step active">1</div>
        <div className="progress-stepLine">---</div>
        <div className="progress-step">2</div>
        <div className="progress-stepLine">---</div>
        <div className="progress-step">3</div>
      </div>

      {/* 이용 약관 동의 */}
      <div className="terms-container">
        <div className="terms-checkbox">
          <input 
            type="checkbox" 
            id="terms-agree"
            className="check_btn"
            checked={termsAgree}  //상태에 따라 체크 여부 결정
            onChange={(e) => setTermsAgree(e.target.checked)} // 체크박스 변경 시 상태 업데이트
            />
          <label htmlFor="terms-agree">티코 이용 약관에 동의합니다. (필수)</label>
        </div>
        <div className="terms-content">
          <p>제 1 조 (목적)</p>
          <p>이 약관은 재단법인 네이버 커넥트 (이하 "재단")가 제공하는 온라인 소프트웨어 교육 플랫폼인 엔트리 서비스 (이하 "티코") 및 티코와 관련한 제반 서비스의 이용과 관련하여 재단과 회원과의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          <p>제 2 조 (정의)</p>
          <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          {/* ... 나머지 약관 내용 ... */}
        </div>
      </div>

      {/* 개인정보 처리 방침 동의 */}
      <div className="privacy-container">
        <div className="privacy-checkbox">
          <input 
            type="checkbox" 
            id="privacy-agree"
            className="check_btn"
            checked={privacyAgree}  // 상태에 따라 체크 여부 결정
            onChange={(e) => setPrivacyAgree(e.target.checked)} // 체크박스 변경 시 상태 업데이트
            />
          <label htmlFor="privacy-agree">개인 정보 수집 및 이용에 동의합니다. (필수)</label>
        </div>
        <div className="privacy-content">
          <p>- 선택 항목: 네이버 아이디</p>
          <p>3) 카카오 로그인으로 회원 가입 시</p>
          <p>- 필수 항목: 성별, 이메일 주소, (선생님의 경우) 휴대 전화 번호</p>
          <p>4) 서비스 내 행사의 경품으로 재화 또는 서비스를 제공하는 경우 추가적으로 다음과 같은 개인 정보를 수집할 수 있습니다.</p>
          <p>- 선택 항목: 아이디, 닉네임, 이메일 주소, 전화 번호, 주소, IP 주소, 생년월일, (만 14세 미만인 경우) 보호자의 이</p>
          {/* ... 나머지 개인 정보 처리 방침 내용 ... */}
        </div>
      </div>

      {/* 오류 메시지 표시 */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* 회원가입 버튼 */}
        <button className="signup-button id" onClick={signUpSubmit('id')}>
          아이디로 회원가입
        </button>

        <div className="social-signUp">
            <button className="social-signUpLink naver" onClick={signUpSubmit('naver')}>
              네이버로 회원가입
            </button>
      
            <button className="social-signUpLink kakao" onClick={signUpSubmit('kakao')}>
              카카오로 회원가입
            </button>

            <button className="social-signUpLink google" onClick={signUpSubmit('google')}>
              구글로 회원가입
            </button>
        </div>
    </div>
  );
}

export default Signup;