import React, { useEffect, useState } from "react";
import "./NoticeDetail.css";
import axiosInstance from "../login/social/utils/axiosInstance";
/**
 * 실제 서비스에선 -
 *   1) react-router 로 목록 → 상세 페이지 이동 시
 *   2) URL 파라미터(id) 로 API   /api/notice/{id}  를 GET
 *      → 받아온 데이터를 이 컴포넌트 state 에 넣어 렌더링합니다.
 *
 * 여기선 디자인·구조 예시만 보여주기 위해
 * 샘플 객체를 그대로 사용했어요.
 */
const sampleNotice = {
  type: "새로운 기능",
  title: "2021년 9~10월 업데이트 안내: 태블릿/스마트폰 대응 (추가)",
  date: "21.10.28",
  writer: "엔트리팀",
  view: 79446,
  like: 411,
  /** 본문을 간단히 HTML-string 으로 두었습니다.
   *  실제론 Markdown 을 HTML 로 변환하거나
   *  <p>,<h2> 등의 구조화된 데이터를 map 으로 돌려 출력해도 좋아요.
   */
  content: `
  <p>안녕하세요? 엔트리팀입니다.<br/>
  찬바람이 부는 가을이 다 되었네요🍁<br/>
  오랜만에 가져온 업데이트 소식입니다 :) 늦어져서 미안해요</p>

  <p>이번엔 조금 큰 업데이트를 준비했는데요… 어떤 부분이 바뀌었는지 한 번 살펴볼까요?</p>

  <p>아래 사항이 정상적으로 보이지 않거나, 작품 만들기에 접속되지 않는 경우,<br/>
  인터넷 브라우저의 설정에서 캐시를 삭제한 후 다시 한번 확인해보세요.</p>

  <p>🐰 새로운 기능</p>

  <p>이번 업데이트 내용은 설명 드릴 게 많아서 아래처럼 정리해 봤어요!</p>

  <p>1. 태블릿과 스마트폰을 위한 전용 화면을 추가했어요.</p>

  <p>홈 화면<br/>
  엔트리의 모든 화면에 레이아웃 모바일 전용 UI를 적용했습니다.<br/>
  태블릿으로 교육 현장 등에서 주로 사용하는 기종이 해상도에 맞췄고,<br/>
  스마트폰에서도 엔트리 작품을 실행하고, 커뮤니티를 이용할 수 있게 되었답니다.</p>
  `
};


const NoticeDetail = () => {
  const {
    type,
    title,
    date,
    writer,
    view,
    like,
    content
  } = sampleNotice;

  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axiosInstance.get("/api/noticeGet")
      .then(res => setNotices(res.data))
      .catch(err => {
        console.error("❌ 공지사항 디테일 로딩 실패:", err);
        setNotices([]);
      });
  }, []);

  return (
    <div className="notice-detail-wrap">
      {/* --- 상단 제목 & 메타 --- */}
      <header className="notice-detail-header">
        <h1 className="notice-detail-page-title">공지사항</h1>

        <div className="notice-detail-title-row">
          <span className={`notice-label notice-label-${type === "새로운 기능" ? "new" : "default"}`}>
            {type}
          </span>
          <span className="notice-detail-title">{title}</span>
        </div>

        <div className="notice-detail-meta">
          <span>{date}</span>
          <span>· {writer}</span>
          <span>· 조회 {view.toLocaleString()}</span>
          <span>· 좋아요 {like.toLocaleString()}</span>
        </div>
      </header>

      <hr className="notice-detail-divider" />

      {/* --- 본문 --- */}
      <article
        className="notice-detail-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default NoticeDetail;
