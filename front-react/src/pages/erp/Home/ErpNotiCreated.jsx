import React, { useEffect, useState } from 'react';
import './erpNotiCreated.css';
import axiosInstance from '../../login/social/utils/axiosInstance';

// 공지사항 등록 컴포넌트
const ErpNotiCreated = ({ onRegisterSuccess }) => {

  // 공지사항 작성 폼의 상태값 초기화
  const [notice, setNotice] = useState({
    erpNotiTitle: '',
    erpNotiContent: '',
    empId: '',
    erpNotiType: '',
    erpNotiExpiredAt: '',
    erpNotiFile: null,
  });

  // 로그인된 사용자 ID 불러오기
  useEffect(() => {
    const savedEmpId = localStorage.getItem('user_uuid');
    if (savedEmpId) {
      setNotice(prev => ({ ...prev, empId: savedEmpId }));
    }
  }, []);

  // 입력 필드 변경 시 상태 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotice({ ...notice, [name]: value });  // 불변성 유지 + 동적 key로 상태 업데이트
  };

  // 파일 첨부 시 상태 업데이트
  const handleFileChange = (e) => {
    setNotice({ ...notice, erpNotiFile: e.target.files[0] });
  };

  // 폼 제출 이벤트 처리
  const handleSubmit = (e) => {
    e.preventDefault();   // 기본 폼 제출 동작 방지

    // FormData 객체로 데이터 구성  FormData: 파일과 데이터를 함께 서버로 전송할 때 쓰는 내장객체(특히, multipart/form-data 형식의 HTTP 요청을 보낼 때 사용)
    const formData = new FormData();
    Object.entries(notice).forEach(([key, value]) => {    // 배열의 배열로 변환
      if (value) formData.append(key, value);   // 값이 있는 항목만 추가
    });

    // 백엔드로 POST 요청 전송 (multipart/form-data)
    axiosInstance
      .post('/api/notices/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        alert('공지사항이 등록되었습니다.');
        onRegisterSuccess();    // 등록 성공 시 상위 컴포넌트에 알림
      })
      .catch((error) => {
        console.error('Error creating notice:', error);
        alert('공지사항 등록에 실패했습니다.');
      });
  };

  return (
    <div className="notice-create-container">
      <h3>공지사항 등록</h3>

      {/* 공지사항 등록 폼 */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="erpNotiTitle">제목</label>
          <input type="text" name="erpNotiTitle" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="erpNotiContent">내용</label>
          <textarea name="erpNotiContent" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="empId">작성자 ID</label>
          <input type="text" name="empId" value={notice.empId} readOnly />
        </div>

        <div className="form-group">
          <label htmlFor="erpNotiType">공지사항 유형</label>
          <select name="erpNotiType" onChange={handleChange} required>
            <option value="">유형 선택</option>
            <option value="일반">일반</option>
            <option value="긴급">긴급</option>
            <option value="교육">교육</option>
            <option value="휴무">휴무</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="erpNotiExpiredAt">만료일</label>
          <input type="date" name="erpNotiExpiredAt" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="erpNotiFile">첨부 파일</label>
          <input type="file" name="erpNotiFile" onChange={handleFileChange} />
        </div>

        <button type="submit">등록</button>
      </form>
    </div>
  );
};

export default ErpNotiCreated;
