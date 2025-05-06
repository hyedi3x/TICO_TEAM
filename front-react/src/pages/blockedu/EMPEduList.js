import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import "./EduList.css";
import axios from "axios";
import axiosInstance from "../login/social/utils/axiosInstance";

const EMPEduList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState([]);
  const [sortOption, setSortOption] = useState("등록순"); // 기본 정렬 옵션
  const [deleteFilter, setDeleteFilter] = useState("DEFAULT"); // 삭제 여부 필터, 기본 전체 조회

  // 목록 불러오기
    const fetchQuizzes = async () => {
      try {
        const response = await axiosInstance.get("/api/quiz/eduList");
        const data = response.data;
        setQuizzes(data.quizDTO);
        setUser(data.solvedDTO);
      } catch (error) {
        console.error("퀴즈 데이터를 불러오는 중 오류 발생:", error);
        alert("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // 정렬된 퀴즈 리스트 반환
  const getSortedQuizzes = () => {
    const filtered = quizzes.filter(q => {
      if (deleteFilter === "DEFAULT") return true; // filter : 각요소에 콜백함수 실행, true인 요소들만 모아 새로운 배열을 생성 (삭제여부 - 전체 보기)
      return q.isdelete === deleteFilter;
    });

    switch (sortOption) {
      case "등록순":
        return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        //sort() : 배열 정렬 메서드, 계산을 위해 날짜로 변환 (오름차순)
      case "최신순":
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // (내림차순)
      default:
        return filtered;
    }
  };

  // 삭제여부 변경, 영구 삭제를 통합 : 매우 간단한 요청이라 유지보수 보다 코드 가독성 우선
  const manageQuiz = async (id, action) => {
    if (window.confirm(`정말 [${id}번] 항목을 ${action === 'delete' ? '삭제' : action === 'restore' ? '삭제 취소' : '영구 삭제'}하시겠습니까?`)) {
      try {
        const response = await axiosInstance.patch('/api/eduBlock/manageQuiz', {
          quiz_id: id,
          action: action
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
      
        alert(`요청 성공: ${action}`);
      
        setQuizzes(prev => {
          if (action === 'hardDelete') {
            // 영구 삭제인 경우 해당 quiz_id를 제거
            return prev.filter(quiz => quiz.quiz_id !== id);
          }
      
          // 그 외 (delete, restore)는 isdelete 값만 변경
          return prev.map(quiz =>
            quiz.quiz_id === id
              ? {
                  ...quiz,
                  isdelete: action === 'delete'
                    ? 'Y'
                    : action === 'restore'
                    ? 'N'
                    : quiz.isdelete
                }
              : quiz
          );
        });
      } catch (error) {
        console.error(`${action} 중 오류 발생:`, error);
        alert(`${action} 중 오류가 발생했습니다.`);
      }
    }
  };

  return (
    <div className="quiz-wrapper">
      <div className="quiz-all-container">
        <div className="quiz-header">
          <span className="quiz-title">🧑‍🎓 퀴즈 목록 [ 총 {quizzes.length}문제 ]</span>
        </div>

        {/* 드롭다운 2개: 삭제 여부 / 정렬 기준 */}
        <div className="quiz-sort-container">
          <select
            className="quiz-sort-select"
            value={deleteFilter}
            onChange={(e) => setDeleteFilter(e.target.value)}
          >
            <option value="DEFAULT">-- 삭제 여부 --</option>
            <option value="N">미삭제(N)</option>
            <option value="Y">삭제(Y)</option>
          </select>

          <select
            className="quiz-sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="등록순">등록순</option>
            <option value="최신순">최신순</option>
          </select>
        </div>

        <Table striped bordered hover className="quiz-table">
          <thead>
            <tr>
              <th className="status-col">no.</th>
              <th className="title-col">제목</th>
              <th>난이도</th>
              <th>링크</th>
              <th>삭제 여부</th>
              <th className="btn-th">관리</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {getSortedQuizzes().map((dto, index) => (
              <tr key={index}>
                <td className="num-col">{dto.quiz_id}</td>
                <td className="title-col">{dto.quiz_title}</td>
                <td>{dto.quiz_level}</td>
                <td>
                  <button
                    onClick={() => navigate(`/quizput/${dto.quiz_id}`)}
                    className="btn btn-edit"
                  >
                    {dto.quiz_id}번 수정
                  </button>
                </td>
                <td>{dto.isdelete === "Y" ? "Y" : "N"}</td>
                <td className="btn-col">
                  {dto.isdelete === "Y" ? (
                    <>
                      <button
                        className="btn btn-delete"
                        onClick={() => manageQuiz(dto.quiz_id, 'hardDelete')}
                      >
                        영구삭제
                      </button>
                      <button
                        className="btn btn-restore"
                        onClick={() => manageQuiz(dto.quiz_id, 'restore')}
                      >
                        삭제취소
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-hide"
                      onClick={() => manageQuiz(dto.quiz_id, 'delete')}
                    >
                      삭제
                    </button>
                  )}
                </td>
                <td>{dto.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default EMPEduList;
