import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import "./eduList.css";

const EduList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState([]);
  const [sortOption, setSortOption] = useState("등록순"); // 기본 정렬 옵션
  // 난이도 정렬 기준 정의
  const levelOrder = ["쉬움", "보통", "어려움", "매우 어려움"];

  const user_uuid = localStorage.getItem("user_uuid");
  console.log("user_uuid : ", user_uuid);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("http://localhost:8081/quiz/eduList", { method: "GET" });
        if (!response.ok) throw new Error("퀴즈 데이터를 불러오는 데 실패했습니다.");
        const data = await response.json();
        setQuizzes(data.quizDTO);
        setUser(data.solvedDTO);
      } catch (error) {
        console.error("퀴즈 데이터를 불러오는 중 오류 발생:", error);
        alert("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };
    fetchQuizzes();
  }, []);
  
  // 정렬된 퀴즈 리스트 반환
  const getSortedQuizzes = () => {
    const quizzesCopy = [...quizzes];
    switch (sortOption) {
      case "등록순":
        return quizzesCopy.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case "최신순":
        return quizzesCopy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case "쉬움→어려움":
        return quizzesCopy.sort((a, b) => levelOrder.indexOf(a.quiz_level) - levelOrder.indexOf(b.quiz_level)); // 레벨을 담은 배열의 인덱스로 오름차순 정렬
      case "어려움→쉬움":
        return quizzesCopy.sort((a, b) => levelOrder.indexOf(b.quiz_level) - levelOrder.indexOf(a.quiz_level));
      default:
        return quizzesCopy;
    }
  };

  const isSolvedByUser = (quiz_id) => {
    const solvedItem = user.find(item =>
      item.quiz_id === quiz_id && item.user_uuid === user_uuid
    );
    return solvedItem ? solvedItem : null;
  };

  return (
    <div className="quiz-wrapper">
      <h5 className="quiz-count">총 {quizzes.length}문제</h5>
      {/* 드롭다운을 테이블 우측 상단에 배치 */}
      <div className="quiz-sort-container">
        <select
          className="quiz-sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="등록순">등록순</option>
          <option value="최신순">최신순</option>
          <option value="쉬움→어려움">난이도 쉬움→어려움</option>
          <option value="어려움→쉬움">난이도 어려움→쉬움</option>
        </select>
      </div>

      <Table striped bordered hover className="quiz-table">
        <thead>
          <tr>
            <th className="status-col">no.</th>
            <th className="title-col">제목</th>
            <th>난이도</th>
            <th>링크</th>
            <th>완료 여부</th>
            <th>문제 푼 횟수</th>
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
                  onClick={() => navigate(`/quiz/${dto.quiz_id}`)}
                  className="btn btn-sm btn-outline-primary"
                >
                  {dto.quiz_id}번 풀러가기
                </button>
              </td>
              <td>{isSolvedByUser(dto.quiz_id) ? "✅ 완료" : "❌ 미완료"}</td>
              <td>{isSolvedByUser(dto.quiz_id)?.solved_count || "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default EduList;