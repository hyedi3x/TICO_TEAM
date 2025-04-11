// FindIdPassword.jsx
import React, { useState } from 'react';
import axiosInstance from '../login/social/utils/axiosInstance';
import './findIdPassword.css';
import { useNavigate } from 'react-router-dom';

function FindIdPassword() {
  // 탭 관리: "이메일 찾기"와 "비밀번호 재설정"
  const [mode, setMode] = useState('email'); // 'email' 또는 'pw'

  const navigate = useNavigate();

  // [이메일 찾기]용 상태 (이메일 찾기는 이름 + 전화번호 기준)
  const [findName, setFindName] = useState('');
  const [findPhone, setFindPhone] = useState('');
  const [foundEmail, setFoundEmail] = useState('');

  // [비밀번호 재설정]용 상태
  const [pwEmail, setPwEmail] = useState('');
  const [step, setStep] = useState(1);
  // step 1: 이메일 입력 후 인증 코드 발송
  // step 2: 인증 코드 입력 및 검증
  // step 3: 새 비밀번호 입력 및 재설정
  const [authCode, setAuthCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState('');
  // 로딩 상태는 boolean 타입으로 관리합니다.
  const [loading, setLoading] = useState(false);

  // 이메일(아이디) 찾기: 이름과 전화번호로 사용자 조회
  const handleFindEmail = async () => {
    try { // await는 응답이 올때까지 기다렸다가 다음 코드를 실행하게 하는 함수
      const response = await axiosInstance.post('/auth/find-id', {
        name: findName,
        phone: findPhone,
      });
      setFoundEmail(response.data.email);
      setMessage("가입 시 사용하신 이메일(아이디)를 찾았습니다.");
    } catch (error) {
      const errData = error.response?.data;
      if (typeof errData === 'string') {
        setMessage(errData);
      } else if (errData?.message) {
        setMessage(errData.message);
      } else {
        setMessage("알 수 없는 오류");
      }
    }
  };

  // 비밀번호 재설정 – Step1: 인증 코드 발송 (로딩 상태 적용)
  const handleSendCode = async () => {
    setLoading(true); // 요청 시작 시 로딩 상태 true
    try {
      await axiosInstance.post('/auth/send-code', { email: pwEmail });
      setMessage("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
      setStep(2);
    } catch (error) {
      const errData = error.response?.data;
      let msg = "인증 코드 발송에 실패했습니다.";
      if (typeof errData === 'string') {
        msg = errData;
      } else if (errData && typeof errData === 'object') {
        msg = errData.message || JSON.stringify(errData);
      }
      setMessage(msg);
    }
    setLoading(false); // 요청 완료 시 로딩 상태 false
  };

  // 비밀번호 재설정 – Step2: 인증 코드 검증
  const handleVerifyCode = async () => {
    try {
      await axiosInstance.post('/auth/verify-code', { email: pwEmail, code: authCode });
      setMessage("인증이 완료되었습니다. 새 비밀번호를 설정해주세요.");
      setStep(3);
    } catch (error) {
      setMessage(error.response?.data || "인증 코드가 올바르지 않습니다.");
    }
  };

  // 비밀번호 재설정 – Step3: 새 비밀번호 입력 및 재설정
  const handleResetPassword = async () => {
    try {
      await axiosInstance.post('/auth/reset-password', {
        email: pwEmail,
        newPassword: newPassword,
      });
      alert("비밀번호가 성공적으로 변경 되었습니다. 로그인 이후 이용 부탁드립니다")
      setMessage("비밀번호가 성공적으로 변경되었습니다.");
      // 성공 후 초기화
      setStep(1);
      setPwEmail('');
      setAuthCode('');
      setNewPassword('');
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data || "비밀번호 재설정에 실패했습니다.");
    }
  };

  return (
    <div className="find-container">
      {/* 로딩 중이면 전체 화면 오버레이를 표시 */}
      {loading && (
        <div className="loading-overlay">
          <p>잠시만 기다려주세요 메일 발송중입니다....</p>
        </div>
      )}
      <div className="find-box">
        <h2>이메일(아이디) / 비밀번호 찾기</h2>

        {/* 탭 버튼 */}
        <div className="tab-buttons">
          <button onClick={() => { setMode('email'); setMessage(''); }}>이메일 찾기</button>
          <button onClick={() => { setMode('pw'); setMessage(''); setStep(1); }}>비밀번호 재설정</button>
        </div>

        {/* 이메일 찾기 섹션 */}
        {mode === 'email' && (
          <div className="find-section">
            <h3>이메일 찾기</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="이름을 입력하세요."
                value={findName}
                onChange={(e) => setFindName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="전화번호를 입력하세요."
                value={findPhone}
                onChange={(e) => setFindPhone(e.target.value)}
              />
            </div>
            <button onClick={handleFindEmail}>이메일 찾기</button>
            {foundEmail && <p>찾은 이메일(아이디): {foundEmail}</p>}
          </div>
        )}

        {/* 비밀번호 재설정 섹션 */}
        {mode === 'pw' && (
          <div className="find-section">
            <h3>비밀번호 재설정</h3>
            {step === 1 && (
              <>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="가입한 이메일을 입력하세요."
                    value={pwEmail}
                    onChange={(e) => setPwEmail(e.target.value)}
                  />
                </div>
                {/* 로딩 상태가 아니라면 인증코드 발송 버튼을 보여줍니다. */}
                {!loading && <button onClick={handleSendCode}>인증코드 발송</button>}
              </>
            )}
            {step === 2 && (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="인증코드를 입력하세요."
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                  />
                </div>
                <button onClick={handleVerifyCode}>인증코드 확인</button>
              </>
            )}
            {step === 3 && (
              <>
                <div className="input-group">
                  <input
                    type="password"
                    placeholder="새로운 비밀번호"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button onClick={handleResetPassword}>비밀번호 변경</button>
              </>
            )}
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default FindIdPassword;
