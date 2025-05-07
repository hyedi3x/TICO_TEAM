import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import "./EduList.css";
import axiosInstance from "../login/social/utils/axiosInstance";

const EduList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]); // 퀴즈 리스트 상태
  const [user, setUser] = useState([]); // 유저가 푼 퀴즈 상태
  const [sortOption, setSortOption] = useState("등록순"); // 기본 정렬 옵션
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  const [pageGroup, setPageGroup] = useState([]); // 현재 페이지 그룹 상태 (5개 페이지씩)

  const quizzesPerPage = 10;  // 한 페이지에 표시할 퀴즈 개수
  const pageGroupSize = 5;  // 페이지 그룹 크기 (5개씩)
  const levelOrder = ["쉬움", "보통", "어려움", "매우 어려움"]; // 난이도 정렬 기준

  const user_uuid = localStorage.getItem("user_uuid");

  // 퀴즈 데이터를 가져오는 함수
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axiosInstance.get("/api/quiz/eduList");
      
        // 응답 데이터에서 퀴즈와 푼 퀴즈 데이터를 추출
        const data = response.data;
        setQuizzes(data.quizDTO); // 퀴즈 목록 상태에 저장
        setUser(data.solvedDTO); // 푼 퀴즈 목록 상태에 저장

        // 총 페이지 수 계산
        const totalPagesCount = Math.ceil(data.quizDTO.length / quizzesPerPage);
        setTotalPages(totalPagesCount);

        // 페이지 그룹 업데이트
        updatePageGroup(totalPagesCount, currentPage);
      } catch (error) {
        console.error("퀴즈 데이터를 불러오는 중 오류 발생:", error);
        alert("퀴즈 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };
    fetchQuizzes();
  }, [currentPage]); // currentPage가 변경될 때마다 퀴즈를 다시 가져오도록 함

  // 페이지 그룹을 계산하여 상태에 저장
  const updatePageGroup = (totalPagesCount, currentPage) => {
    const groupStart = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPagesCount);
    const newPageGroup = [];
    for (let i = groupStart; i <= groupEnd; i++) {
      newPageGroup.push(i);
    }
    setPageGroup(newPageGroup);
  };

  // 정렬된 퀴즈 리스트 반환
  const getSortedQuizzes = () => {
    const quizzesCopy = [...quizzes]; // 기존 퀴즈 배열을 복사하여 정렬
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

  // 유저가 푼 퀴즈 여부 확인
  const isSolvedByUser = (quiz_id) => {
    const solvedItem = user.find(item =>
      item.quiz_id === quiz_id && item.user_uuid === user_uuid
    );
    return solvedItem ? solvedItem : null;
  };

  // 페이지네이션: 페이지 번호 변경 함수
  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="quiz-wrapper">
      <div className="quiz-all-container">
        <p className="quiz-subtitle">💡 퀴즈를 풀며 블록 코딩을 재미있게 학습해보세요!</p>
        <div className="quiz-count">총 {quizzes.length}문제</div>
        
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

        {/* 퀴즈 리스트 테이블 */}
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
            {getSortedQuizzes()
              .filter(dto => dto.isdelete === "N")
              .slice((currentPage - 1) * quizzesPerPage, currentPage * quizzesPerPage)  // 현재 페이지에 해당하는 퀴즈만 표시
              .map((dto, index) => (
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

        {/* 페이지네이션 */}
        <div className="q-pagination-container">
          <button
            onClick={() => changePage(currentPage - 1)} 
            disabled={currentPage === 1}
            className={`f_pageBtn ${currentPage === 1 ? 'disabled' : ''}`}
          >
            ❮
          </button>

          {pageGroup.map((pageNumber) => (
            <button 
              key={pageNumber}
              onClick={() => changePage(pageNumber)}
              className={`f_pageBtn ${pageNumber === currentPage ? 'active' : ''}`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={() => changePage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className={`f_pageBtn ${currentPage === totalPages ? 'disabled' : ''}`}
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};

export default EduList;
