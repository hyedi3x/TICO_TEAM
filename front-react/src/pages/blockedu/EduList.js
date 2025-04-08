import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import "./eduList.css";

const EduList = () => {

  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("http://localhost:8081/quiz/eduList", { method: "GET" });
        if (!response.ok) throw new Error("퀴즈 데이터를 불러오는 데 실패했습니다.");
        const data = await response.json();
        setQuizzes(data.quizDTO);
        console.log('quizDTO:', data.quizDTO);
        setUser(data.solvedDTO);
        console.log('solvedDTO:', data.solvedDTO);

      } catch (error) {
        console.error("퀴즈 데이터를 불러오는 중 오류 발생:", error);
        alert("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };
    fetchQuizzes();
  }, []);

  const isSolvedByUser = (quiz_id) => {
    const result = user.some((item) => {
      // .some() 메서드는 배열을 돌면서 조건을 만족하는 값이 하나라도 있으면 true를 반환
      
      const isMatchingId = item.quiz_id === quiz_id; // 받아올 때 _는 카멜표기법 대문자로 바뀜
      const isMatchingUser = item.user_uuid === "1753fb32-6820-4840-9abc-ac5711f0ea5f";
      const isMatch = isMatchingId && isMatchingUser; // 참, 거짓 반환

      return isMatch;
    });
  
    return result;
  };

  return (
    <div className="quiz-wrapper">
      <h5 className="quiz-count">총 {quizzes.length}문제</h5>
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
          {quizzes.map((dto, index) => (
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
              <td>{user.find(item => item.quiz_id === dto.quiz_id)?.solved_count || "-"}</td>
              {/* 찾은 항목이 존재할 경우에만 solved_count에 접근 */}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default EduList;
