import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../login/social/utils/axiosInstance';
import './SocialSignup.css';

function SocialSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email      = queryParams.get('email') || '';
  const provider   = queryParams.get('provider') || '';
  const providerId = queryParams.get('providerId') || '';
  const name       = queryParams.get('name') || '';
  
  // 추가 입력받을 항목: 닉네임, 전화번호 , 생년월일
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 컴포넌트 마운트 시, 쿼리 파라미터로 넘어온 birthDate/phone/nickname 초기값 세팅
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setBirthDate(params.get('birthDate') || '');
    setPhone(    params.get('phone')     || '');
    setNickname(params.get('nickname')   || '');
  }, [location.search]);

  // 폼 제출 시 소셜 회원가입 API 호출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!birthDate) {
      setErrorMessage('생년월일을 선택해주세요');
      return;
    }
    
    const payload = {
      email,
      name,
      nickname,
      phone,
      birthDate,
      provider,
      birthDate,
      providerId,
      password: null  // 소셜 회원가입은 password가 필요없음
    };
    try {
      const res = await axiosInstance.post('/auth/social/register', payload);
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate('/welcome');
    } catch (error) {
      setErrorMessage(error.response?.data || '회원가입 실패');
    }
  };

  return (
    <div className="social-signup-container">
      <h1>소셜 간편 회원가입</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이메일:</label>
          <input type="email" value={email} readOnly />
        </div>
        <div>
          <label>이름:</label>
          <input type="text" value={name} readOnly />
        </div>
        <div className="form-group">
          <label>생년월일:</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>닉네임:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <div>
          <label>전화번호:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button type="submit">회원가입 완료</button>
      </form>
    </div>
  );
}

export default SocialSignup;
