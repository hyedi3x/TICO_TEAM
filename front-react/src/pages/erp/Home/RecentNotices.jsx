// RecentNotices.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './recentNotices.css';

// 최근 공지사항 컴포넌트 정의
function RecentNotices({ onNoticeClick }) {

  // 상태 정의: 공지 목록 저장용
  const [notices, setNotices] = useState([]);

  // 컴포넌트 마운트 시 최근 공지사항 5개 불러오기
  useEffect(() => {
    axios.get('http://localhost:8081/api/notices/latest?size=5')
      .then((res) => setNotices(res.data))
      .catch((err) => console.error('❌ 최근 공지사항 불러오기 실패:', err));
  }, []);

  // 날짜 포맷 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';                         // 예외 처리
    return new Date(dateString).toLocaleDateString();   // 날짜 객체 → 로컬 문자열
  };

  // 렌더링 영역
  return (
    <div className="recent-notice-container">
      <h3>📢 최근 공지사항</h3>
      <ul className="recent-notice-list">
        {notices.map((notice) => (
          <li
            key={notice.erpNotiId}
            onClick={() => onNoticeClick(notice.erpNotiId)}
            className="recent-notice-item"
          >
            <span className="notice-title">{notice.erpNotiTitle}</span>
            <span className="notice-date">{formatDate(notice.erpNotiCreatedAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentNotices;
