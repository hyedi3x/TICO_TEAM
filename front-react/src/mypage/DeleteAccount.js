import React from 'react';
import axiosInstance from '../pages/login/social/utils/axiosInstance'; 
import { useNavigate } from 'react-router-dom';
import './deleteAccount.css';

function DeleteAccount() {
  const navigate = useNavigate();

  const handleDelete = () => {
    if (window.confirm("정말로 회원 탈퇴하시겠습니까?")) {
      // 우선 GET /auth/user를 통해 현재 사용자 이메일을 가져오는 것도 방법
      axiosInstance.get('/auth/user')
        .then(response => {
          const email = response.data.email;
          // DELETE 요청 시 email을 쿼리 파라미터로 전달
          axiosInstance.delete(`/auth/user?email=${encodeURIComponent(email)}`)
            .then(() => {
              alert("회원 탈퇴가 완료되었습니다.");
              // 토큰 삭제 및 로그인 페이지로 리다이렉트
              localStorage.clear();
              navigate('/login');
            })
            .catch(error => {
              console.error('회원 탈퇴 실패:', error);
              alert("회원 탈퇴에 실패했습니다.");
            });
        })
        .catch(error => {
          console.error('사용자 정보 조회 실패:', error);
          alert("회원 탈퇴에 필요한 정보를 가져오지 못했습니다.");
        });
    }
  };

  return (
    <div className="mypage-content">
      <h2>회원 탈퇴</h2>
      <p>회원 탈퇴를 진행하려면 아래 버튼을 클릭하세요.</p>
      <button onClick={handleDelete} className="delete-button">
        회원 탈퇴
      </button>
    </div>
  );
}

export default DeleteAccount;
