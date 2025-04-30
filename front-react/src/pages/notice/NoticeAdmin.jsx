import React, { useEffect, useState } from "react";
import "./Notice.css";
import axiosInstance from "../login/social/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function NoticeAdmin() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterShow, setFilterShow] = useState("all");
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    axiosInstance.get("/api/noticeGet")
      .then(res => setNotices(res.data))
      .catch(err => {
        console.error("❌ 공지사항 목록 로딩 실패:", err);
        setNotices([]);
      });
  }, []);

  // 👉 삭제/삭제취소/영구삭제 핸들러
  const handleDelete = (noticeId) => {
    axiosInstance.put(`/api/noticeDelete/${noticeId}`)
    .then(() => {
        setNotices(prev => prev.map(n =>
        n.noticeId === noticeId ? { ...n, showFlag: "N" } : n
        ));
    })
    .catch(err => console.error("삭제 실패:", err));
  };
  
  const handleRestore = (noticeId) => {
    axiosInstance.put(`/api/noticeRestore/${noticeId}`)
    .then(() => {
        setNotices(prev => prev.map(n =>
        n.noticeId === noticeId ? { ...n, showFlag: "Y" } : n
        ));
    })
    .catch(err => console.error("삭제취소 실패:", err));
  };
  
  const handlePermanentDelete = (noticeId) => {
    if (window.confirm("영구 삭제하시겠습니까? (복구 불가)")) {
      axiosInstance.delete(`/api/noticePermanentDelete/${noticeId}`)
        .then(() => {
          setNotices(prev => prev.filter(n => n.noticeId !== noticeId));
        })
        .catch(err => console.error("영구삭제 실패:", err));
    }
  };

  const filtered = notices
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
    .filter(n => {
      if (filterShow === "all") return true;
      if (filterShow === "show") return n.showFlag === "Y";
      if (filterShow === "deleted") return n.showFlag === "N";
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest": return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "like":   return b.likesLength - a.likesLength;
        case "view":   return b.visitLength - a.visitLength;
        default:       return 0;
      }
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const paged = filtered.slice(startIdx, startIdx + perPage);

  const getTypeClass = (type) => {
    if (type === "새로운 기능") return "notice-type-new";
    if (type === "중요") return "notice-type-important";
    if (type === "이벤트") return "notice-type-event";
    return "";
  };

  useEffect(() => { setCurrentPage(1); }, [search, sortBy, filterShow]);

  return (
    <div className="notice-container">
      <div className="notice-header-main">
        <h2 className="notice-title">공지사항 관리</h2>
        
        <div className="notice-header-right">
          <div className="notice-search">
            <input type="text" placeholder="검색" />
            <span className="notice-search-icon">🔍</span>
          </div>
          <button className="notice-register-btn" onClick={() => navigate('/noticePost')}>
            공지 등록
          </button>
        </div>
      </div>

      <hr className="notice-divider" />

      {/* 🔥 정렬 + showFlag 필터 */}
      <div className="notice-sort-row" style={{ gap: "8px" }}>
        <select className="notice-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="view">조회순</option>
        </select>
        <select className="notice-select" value={filterShow} onChange={e => setFilterShow(e.target.value)}>
          <option value="all">전체</option>
          <option value="show">미삭제</option>
          <option value="deleted">삭제</option>
        </select>
      </div>

      <div className="notice-list">
        {paged.length === 0 ? (
          <div className="notice-empty">검색 결과가 없습니다.</div>
        ) : (
          paged.map(n => (
            <div className="notice-wrapper" key={n.noticeId}>
              <div className="notice-row" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className={`notice-type ${getTypeClass(n.type)}`}>{n.type}</span>
                  <span className="notice-title-text" onClick={() => navigate(`/noticeDetail/${n.noticeId}`)}>{n.title}</span>
                </div>
                <div className="notice-buttons">
                  {n.showFlag === "Y" ? (
                    <>
                      <button className="notice-btn" onClick={() => navigate(`/noticePut/${n.noticeId}`)}>수정</button>
                      <button className="notice-btn delete" onClick={() => handleDelete(n.noticeId)}>삭제</button>
                    </>
                  ) : (
                    <>
                      <button className="notice-btn" onClick={() => handleRestore(n.noticeId)}>삭제취소</button>
                      <button className="notice-btn delete" onClick={() => handlePermanentDelete(n.noticeId)}>영구삭제</button>
                    </>
                  )}
                </div>
              </div>
              <div className="notice-row2">
                <span className="notice-info">
                  <span>{n.createdAt?.slice(0, 10)}</span>
                  <span>조회 {n.visitLength}</span>
                  <span>{n.showFlag === "N" ? "(삭제됨)" : ""}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="notice-pagination">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>❮</button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            return (
              <button key={p} className={p === currentPage ? "active" : ""} onClick={() => setCurrentPage(p)}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>❯</button>
        </div>
      )}
    </div>
  );
}

export default NoticeAdmin;
