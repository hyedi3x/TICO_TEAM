import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import "./eduList.css";
import { set } from "rsuite/esm/internals/utils/date";

const EduList = () => {

  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState([]);

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

  const isSolvedByUser = (quizId) => {
    const result = user.some((item) => {
      // .some() 메서드는 배열을 돌면서 조건을 만족하는 값이 하나라도 있으면 true를 반환
      
      const isMatchingId = item.quizId === quizId; // 받아올 때 _는 카멜표기법 대문자로 바뀜
      const isMatchingUser = item.userUuid === "0523931d-ada4-4e38-8eaf-a54c9e36ada1";
      const isMatch = isMatchingId && isMatchingUser;

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
            <th>정답률</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((dto, index) => (
            <tr key={index}>
              <td className="num-col">{dto.quiz_id}</td>
              <td className="title-col">{dto.quiz_title}</td>
              <td>{dto.quiz_level}</td>
              <td>
              <a href={`/quiz${index+1}`} className="btn btn-sm btn-outline-primary">
                풀러가기
              </a>
              </td>
              <td>{isSolvedByUser(dto.quiz_id) ? "✅ 완료" : "❌ 미완료"}</td>
              <td>{dto.accuracy}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default EduList;
