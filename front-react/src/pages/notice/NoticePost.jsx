import React, { useState, useEffect } from "react";
import axiosInstance from "../login/social/utils/axiosInstance";
import "./NoticePost.css";
import { useNavigate, useParams } from "react-router-dom";

function NoticePost() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("새로운 기능");
  const [content, setContent] = useState("");
  const empId = localStorage.getItem("user_uuid");
  const navigate = useNavigate();
  const { noticeId } = useParams(); // 🔥 URL에서 noticeId 읽어옴

  useEffect(() => {
    if (noticeId) {
      // 수정모드 ➔ 기존 데이터 불러오기
      axiosInstance.get(`/api/noticeDetailGet/${noticeId}`)
        .then(res => {
          const data = res.data;
          setTitle(data.title);
          setType(data.type);
          setContent(data.content);
        })
        .catch(err => {
          console.error("공지 불러오기 실패:", err);
          alert("공지사항을 불러오지 못했습니다.");
          navigate("/noticeList");
        });
    }
  }, [noticeId, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dto = { empId, title, type, content };

    if (noticeId) {
      // 수정모드
      axiosInstance.put(`/api/noticePut/${noticeId}`, dto)
        .then(() => {
          alert("공지 수정 완료!");
          navigate("/noticeAdmin");
        })
        .catch(err => {
          console.error("수정 실패:", err);
          alert("수정 실패했습니다.");
        });
    } else {
      // 등록모드
      axiosInstance.post("/api/noticePost", dto)
        .then(() => {
          const move = window.confirm("공지 등록 성공! 목록으로 이동하시겠습니까?");
          if (move) {
            navigate("/noticeList");
          } else {
            setTitle('');
            setContent('');
            setType('새로운 기능');
          }
        })
        .catch(err => {
          console.error("등록 실패:", err);
          alert("등록 실패했습니다.");
        });
    }
  }

  return (
    <div className="notice-post-wrapper">
      <h2 className="notice-post-title">{noticeId ? "공지사항 수정" : "공지사항 등록"}</h2>
      <div className="empId-div"> 작성자 {empId} </div>
      
      <form className="notice-post-form" onSubmit={handleSubmit}>
        <div className="notice-form-group">
          <label htmlFor="title">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="notice-form-group">
          <label htmlFor="type">유형</label>
          <select id="type" value={type} onChange={e => setType(e.target.value)}>
            <option value="새로운 기능">새로운 기능</option>
            <option value="이벤트">이벤트</option>
            <option value="중요">중요</option>
          </select>
        </div>

        <div className="notice-form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={15}
            required
          />
        </div>

        <div className="notice-form-actions">
          <button type="submit">{noticeId ? "수정하기" : "등록하기"}</button>
        </div>
      </form>
    </div>
  );
}

export default NoticePost;
