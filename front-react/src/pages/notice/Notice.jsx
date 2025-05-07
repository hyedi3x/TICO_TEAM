import React, { useEffect, useState } from "react";
import "./Notice.css";
import axiosInstance from "../login/social/utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function Notice() {
  const [search,  setSearch]  = useState("");            // 🔍 검색어 상태
  const [sortBy,  setSortBy]  = useState("latest");      // ⬇️ 정렬 기준
  const [notices, setNotices] = useState([]);            // 📋 전체 공지 데이터
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);     // 현재 페이지
  const perPage = 10;                                    // 한 페이지당 공지 수
  const pagesPerGroup = 5;                               // 페이지 번호 그룹 수

  // ✅ 공지 데이터를 서버에서 가져옴
  useEffect(() => {
    axiosInstance.get("/api/noticeGet")
      .then(res => setNotices(res.data))
      .catch(err => {
        console.error("❌ 공지사항 목록 로딩 실패:", err);
        setNotices([]);
      });
  }, []);

  // ✅ 검색어 + 정렬 조건을 기반으로 필터링
  const filtered = notices
    .filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "latest": return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "like":   return b.likesLength - a.likesLength;
        case "view":   return b.visitLength  - a.visitLength;
        default:       return 0;
      }
    });

  // ✅ 전체 페이지 수 계산
  const totalPages = Math.ceil(filtered.length / perPage);

  // ✅ 현재 페이지에 보여줄 데이터 범위 계산
  const startIdx = (currentPage - 1) * perPage;
  const paged = filtered.slice(startIdx, startIdx + perPage);

  // ✅ 현재 페이지가 속한 페이지 그룹 계산 (예: 1~5, 6~10, ...)
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const startPage = currentGroup * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  // ✅ 현재 표시할 페이지 번호들
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // ✅ 공지 유형에 따른 배지 색상 클래스
  const getTypeClass = (type) => {
    if (type === "새로운 기능") return "notice-type-new";
    if (type === "중요")         return "notice-type-important";
    if (type === "이벤트")       return "notice-type-event";
    return "";
  };

  // 🔁 검색어 또는 정렬 조건이 변경될 때 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  return (
    <div className="notice-container">
      
      {/* 📌 헤더: 제목 + 검색창 */}
      <div className="notice-header-main">
        <div className="notice-title">공지사항</div>
        <div className="notice-search">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="제목 검색"
          />
          <span className="notice-search-icon">🔍</span>
        </div>
      </div>

      <hr className="notice-divider" />

      {/* 📌 정렬 드롭다운 */}
      <div className="notice-sort-row">
        <select
          className="notice-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="view">조회순</option>
        </select>
      </div>

      {/* 📌 공지 목록 출력 */}
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
                <span className="notice-title-text" onClick={() => navigate(`/noticeDetail/${n.noticeId}`)}>
                  {n.title}
                </span>
              </div>
              <div className="notice-row2">
                <span className="notice-info">
                  <span>{n.createdAt?.slice(0, 10)}</span>
                  <span>조회 {n.visitLength}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 📌 페이지네이션: 그룹 기반 */}
      {totalPages > 1 && (
        <div className="notice-pagination">
          {/* ◀ 이전 페이지 그룹 */}
          <button
            onClick={() => setCurrentPage(startPage - 1)}
            disabled={startPage === 1}
          >
            ❮
          </button>

          {/* 페이지 번호 그룹 */}
          {pageNumbers.map((p) => (
            <button
              key={p}
              className={p === currentPage ? "active" : ""}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}

          {/* 다음 페이지 그룹 ▶ */}
          <button
            onClick={() => setCurrentPage(endPage + 1)}
            disabled={endPage >= totalPages}
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
}

export default Notice;
