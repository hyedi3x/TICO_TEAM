import React, { useEffect, useState } from "react";
import "./NoticeDetail.css";
import axiosInstance from "../login/social/utils/axiosInstance";
import { useParams } from "react-router-dom";

const NoticeDetail = () => {

  const  { noticeId } = useParams();

  useEffect(() => {
    axiosInstance.put(`/api/noticeView/${noticeId}`)  // 1️⃣ 먼저 조회수 증가
      .then(() => {
        return axiosInstance.get(`/api/noticeDetailGet/${noticeId}`);  // 2️⃣ 조회수 올라간 최신 데이터 가져오기
      })
      .then(res => {
        setNotice(res.data);   // 3️⃣ 최신 데이터로 화면에 반영
      })
      .catch(err => {
        console.error("❌ 공지사항 상세 로딩 실패:", err);
        setNotice([]);
      });
  }, []);
  
  const [notice, setNotice] = useState([]);
  const getTypeClass = (type) => {
    if (type === "새로운 기능") return "notice-type-new";
    if (type === "중요")       return "notice-type-important";
    if (type === "이벤트")     return "notice-type-event";
    return "";
  };
  
  return (
    <div>
      {notice ? (
        <div className="notice-detail-wrap">
          {/* --- 상단 제목 & 메타 --- */}
          <header className="notice-detail-header">
            <h1 className="notice-detail-page-title">공지사항</h1>
  
            <div className="notice-detail-title-row">
              <span className={`notice-type ${getTypeClass(notice.type)}`}>
                {notice.type}
              </span>
              <span className="notice-detail-title">{notice.title}</span>
            </div>
  
            <div className="notice-detail-meta">
              <span>{notice.createdAt?.slice(0, 10)}</span>
              <span>· 작성자 {notice.empId}</span>
              <span>· 조회 {notice.visitLength}</span>
            </div>
          </header>
  
          <hr className="notice-detail-divider" />
  
          {/* --- 본문 --- */}
          <article className="notice-detail-content">
            {notice.content? notice.content : '본문 내용을 등록해주세요.'}
          </article>
        </div>
      ) : (
        <div>로딩중...</div>
      )}
    </div>
  );
  
};

export default NoticeDetail;
