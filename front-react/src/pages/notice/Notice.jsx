import React, { useEffect, useState } from "react";
import "./Notice.css";
import axiosInstance from "../login/social/utils/axiosInstance";
import { Navigate, useNavigate } from "react-router-dom";

function Notice() {
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState("latest");
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  /* 👉 페이지 전용 상태 */
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;                       // 한 페이지 당 10개

  /* ──── 데이터 가져오기 ──── */
  useEffect(() => {
    axiosInstance.get("/api/noticeGet")
      .then(res => setNotices(res.data))
      .catch(err => {
        console.error("❌ 공지사항 목록 로딩 실패:", err);
        setNotices([]);
      });
  }, []);

  /* ──── 검색 + 정렬 ──── */
  const filtered = notices
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "latest": return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "like":   return b.likesLength - a.likesLength;
        case "view":   return b.visitLength  - a.visitLength;
        default:       return 0;
      }
    });

  /* ──── 페이지 계산 & 슬라이스 ──── */
  const totalPages = Math.ceil(filtered.length / perPage);
  const startIdx   = (currentPage - 1) * perPage;
  const paged      = filtered.slice(startIdx, startIdx + perPage);

  /* ──── 타입 → CSS 클래스 ──── */
  const getTypeClass = (type) => {
    if (type === "새로운 기능") return "notice-type-new";
    if (type === "중요")       return "notice-type-important";
    if (type === "이벤트")     return "notice-type-event";
    return "";
  };

  /* 검색·정렬 변경 시 1페이지로 리셋 */
  useEffect(() => { setCurrentPage(1); }, [search, sortBy]);

  return (
    <div className="notice-container">
      {/* 제목 + 검색창 */}
      <div className="notice-header-main">
        <div className="notice-title">공지사항</div>
        <div className="notice-search">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="검색"
          />
          <span className="notice-search-icon">🔍</span>
        </div>
      </div>

      <hr className="notice-divider" />

      {/* 정렬 selectBox */}
      <div className="notice-sort-row">
        <select
          className="notice-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="like">좋아요순</option>
          <option value="view">조회순</option>
        </select>
      </div>

      {/* 공지 목록 */}
      <div className="notice-list">
        {paged.length === 0 ? (
          <div className="notice-empty">검색 결과가 없습니다.</div>
        ) : (
          paged.map(n => (
            <div className="notice-wrapper" key={n.noticeId}>
              <div className="notice-row">
                <span className={`notice-type ${getTypeClass(n.type)}`}>
                  {n.type}
                </span>
                <span className="notice-title-text" onClick={()=>navigate(`/noticeDetail/${n.noticeId}`)}>{n.title}</span>
              </div>
              <div className="notice-row2">
                <span className="notice-info">
                  <span>{n.createdAt?.slice(0,10)}</span>
                  <span>조회 {n.visitLength}</span>
                  <span>좋아요 {n.likesLength}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지 버튼 */}
      {totalPages > 1 && (
        <div className="notice-pagination">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}> ❮ </button>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            return (
              <button key={p}
                      className={p === currentPage ? "active" : ""}
                      onClick={() => setCurrentPage(p)}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}> ❯ </button>
        </div>
      )}
    </div>
  );
}

export default Notice;
