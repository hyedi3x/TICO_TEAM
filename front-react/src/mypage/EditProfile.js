import React, { useEffect, useState } from 'react';
import axiosInstance from '../pages/login/social/utils/axiosInstance'; 
import './editProfile.css';

function EditProfile() {
  const [user, setUser] = useState({
    email: '',
    name: '',
    nickname: '',
    phone: ''
    // 추가 필드가 있다면 여기에 포함
  });

  // 컴포넌트가 마운트될 때 사용자 정보 조회
  useEffect(() => {
    axiosInstance.get('/auth/user')
      .then(response => {
        // 응답 DTO에 맞춰 사용자 정보를 세팅 (예: response.data)
        setUser(response.data);
      })
      .catch(error => {
        console.error('사용자 정보 조회 실패:', error);
        // 에러 처리 (예: 로그인 페이지로 이동)
      });
  }, []);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // 폼 전송 핸들러 (회원정보 수정)
  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance.put('/auth/user', user)
      .then(response => {
        alert('회원 정보가 수정되었습니다.');
        // 필요에 따라 상태 갱신 또는 페이지 이동
        setUser(response.data);
      })
      .catch(error => {
        console.error('회원 정보 수정 실패:', error);
        alert('회원 정보 수정에 실패했습니다.');
      });
  };

  return (
    <div className="mypage-content">
      <h2>회원 정보 수정</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-row">
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={user.email}
            disabled
          />
        </div>

        <div className="form-row">
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>닉네임</label>
          <input
            type="text"
            name="nickname"
            value={user.nickname}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>전화번호</label>
          <input
            type="text"
            name="phone"
            value={user.phone}
            onChange={handleChange}
          />
        </div>

        {/* 추가 입력필드가 있다면 이곳에 계속 추가 */}

        <button type="submit" className="save-button">수정하기</button>
      </form>
    </div>
  );
}

export default EditProfile;
