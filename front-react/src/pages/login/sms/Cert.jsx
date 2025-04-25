// src/pages/Cert.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../social/utils/axiosInstance';
import { getFourteenYearsAgoBoundary } from '../social/utils/dateUtils';
import './cert.css';

export default function Cert() {
  const { state } = useLocation();
  const ageGroup = state?.ageGroup; // "under14" or "over14"
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    birth: '',
    phone: '',
    parentName: '',
    parentPhone: ''
  });
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [step, setStep] = useState('send');
  const [birthDateError, setBirthDateError] = useState('');
  const [nameError, setNameError] = useState('');
  const [parentNameError, setParentNameError] = useState('');

  const boundaryDate = getFourteenYearsAgoBoundary();
  const todayDate = new Date().toISOString().split('T')[0];

  // 이름 유효성 검사: 한글 또는 영문, 2~20자
  const isValidName = (value) => /^[가-힣a-zA-Z]{2,20}$/.test(value);

  const onInputChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // 이름 필드별 검증
    if (name === 'name') {
      setNameError(value && !isValidName(value) ? '올바른 이름을 입력해주세요.' : '');
    }
    if (name === 'parentName') {
      setParentNameError(value && !isValidName(value) ? '올바른 보호자 이름을 입력해주세요.' : '');
    }
    setBirthDateError('');
  };

  const validateBirthDate = () => {
    if (!form.birth) {
      setBirthDateError('생년월일을 입력해주세요.');
      return false;
    }
    const selected = new Date(form.birth).getTime();
    const boundary = new Date(boundaryDate).getTime();
    if (ageGroup === 'under14' && selected < boundary) {
      setBirthDateError('14세 미만만 선택할 수 있습니다.');
      return false;
    }
    if (ageGroup === 'over14' && selected >= boundary) {
      setBirthDateError('14세 이상만 선택할 수 있습니다.');
      return false;
    }
    return true;
  };

  const sendCode = async () => {
    // 기본 검증
    if (!form.name || nameError) return;
    if (!validateBirthDate()) return;
    const to = ageGroup === 'under14' ? form.parentPhone : form.phone;
    try {
      await axiosInstance.post('/api/sms/send', null, { params: { phone: to } });
      setMsg('✅ 인증번호가 전송되었습니다.');
      setStep('verify');
    } catch {
      setMsg('❌ 전송 실패, 번호를 확인해주세요.');
    }
  };

  const verifyCode = async () => {
    const to = ageGroup === 'under14' ? form.parentPhone : form.phone;
    try {
      await axiosInstance.post('/api/sms/verify', null, { params: { phone: to, code } });
      setMsg('🎉 인증 성공! 이어서 회원정보 입력으로 이동합니다.');
      navigate('/signUp/id', { state: { ageGroup, ...form } });
    } catch {
      setMsg('❌ 인증번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="info-form">
      <h3>{ageGroup === 'under14' ? '보호자 정보 및 폰 인증' : '본인 휴대폰 인증'}</h3>

      {/* 이름 입력 */}
      <input
        name="name"
        placeholder="본인 이름"
        value={form.name}
        onChange={onInputChange}
      />
      {nameError && <p className="error-message">{nameError}</p>}

      {/* 생년월일 입력 */}
      <input
        name="birth"
        type="date"
        value={form.birth}
        onChange={onInputChange}
        min={ageGroup === 'under14' ? boundaryDate : '1900-01-01'}
        max={ageGroup === 'under14' ? todayDate : boundaryDate}
      />
      {birthDateError && <p className="error-message">{birthDateError}</p>}

      {/* under14 vs over14 phone inputs */}
      {ageGroup === 'under14' ? (
        <>
          <input
            name="parentName"
            placeholder="보호자 이름"
            value={form.parentName}
            onChange={onInputChange}
          />
          {parentNameError && <p className="error-message">{parentNameError}</p>}
          <input
            name="parentPhone"
            placeholder="보호자 휴대폰"
            value={form.parentPhone}
            onChange={onInputChange}
          />
        </>
      ) : (
        <input
          name="phone"
          placeholder="본인 휴대폰"
          value={form.phone}
          onChange={onInputChange}
        />
      )}

      {/* 전송 / 확인 버튼 */}
      {step === 'send' ? (
        <button
          disabled={
            !form.name || nameError || !form.birth || birthDateError ||
            (ageGroup === 'under14'
              ? !(form.parentName && form.parentPhone) || parentNameError
              : !form.phone)
          }
          onClick={sendCode}
        >
          인증번호 전송
        </button>
      ) : (
        <>
          <input
            placeholder="6자리 인증번호"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/, ''))}
          />
          <button
            disabled={code.length !== 6}
            onClick={verifyCode}
          >
            인증 확인
          </button>
        </>
      )}

      {msg && <p className="error-message" style={{ color: '#555' }}>{msg}</p>}
    </div>
  );
}
