// src/pages/Cert.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../social/utils/axiosInstance';
import './cert.css';

export default function Cert() {
  const { state } = useLocation();
  const ageGroup  = state?.ageGroup;  // "under14" 또는 "over14"
  const navigate  = useNavigate();

  // 폼 상태
  const [form, setForm] = useState({
    name: '',
    birth: '',
    phone: '',
    parentName: '',
    parentPhone: ''
  });
  const [code, setCode] = useState('');
  const [msg, setMsg]   = useState('');
  const [step, setStep] = useState('send'); // 'send' → 'verify'

  // input 핸들러
  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // 인증번호 전송
  const sendCode = async () => {
    const to = ageGroup === 'under14' ? form.parentPhone : form.phone;
    try {
      await axiosInstance.post('/api/sms/send', null, { params: { phone: to } });
      setMsg('✅ 인증번호가 전송되었습니다.');
      setStep('verify');
    } catch {
      setMsg('❌ 전송 실패, 번호를 확인해주세요.');
    }
  };

  // 인증번호 검증
  const verifyCode = async () => {
    const to = ageGroup === 'under14' ? form.parentPhone : form.phone;
    try {
      await axiosInstance.post('/api/sms/verify', null, { params: { phone: to, code } });
      setMsg('🎉 인증 성공! 이어서회원정보 입력으로 이동합니다.');
      navigate('/signUp/id', { state: { ageGroup, ...form } });
    } catch {
      setMsg('❌ 인증번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="info-form">
      {/* 타이틀 */}
      <h3>
        {ageGroup === 'under14'
          ? '보호자 정보 및 폰 인증'
          : '본인 휴대폰 인증'}
      </h3>

      {/* 공통 입력 필드 */}
      <input
        name="name"
        placeholder="본인 이름"
        value={form.name}
        onChange={onChange}
      />
      <input
        name="birth"
        type="date"
        placeholder="생년월일"
        value={form.birth}
        onChange={onChange}
      />

      {/* conditional snippet: under14 vs over14 */}
      {ageGroup === 'under14' ? (
        <>
          <input
            name="parentName"
            placeholder="보호자 이름"
            value={form.parentName}
            onChange={onChange}
          />
          <input
            name="parentPhone"
            placeholder="보호자 휴대폰"
            value={form.parentPhone}
            onChange={onChange}
          />
        </>
      ) : (
        <input
          name="phone"
          placeholder="본인 휴대폰"
          value={form.phone}
          onChange={onChange}
        />
      )}

      {/* 전송 vs. 검증 UI */}
      {step === 'send' ? (
        <button
          disabled={
            !form.name ||
            !form.birth ||
            (ageGroup === 'under14'
              ? !(form.parentName && form.parentPhone)
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

      {/* 안내/오류 메시지 */}
      {msg && <p className="error-message" style={{ color: '#555' }}>{msg}</p>}
    </div>
  );
}
