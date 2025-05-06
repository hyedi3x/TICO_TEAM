import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './popularProjectsTable.css'; 

const PopularProjectsTable = () => {
  const [projects, setProjects] = useState([]);  // 테이블 데이터 상태 관리

  useEffect(() => {
    // 인기 작품 점수 데이터 가져오기
    axios.get('/flask/popular-project-score-summary')
      .then((res) => {
        const data = res.data;

        // 종합 점수 계산 (가중치 적용)
        const scoredData = data.map(item => ({
          ...item,
          totalScore: (
            (item.view_count * 0.4) +      // 조회수 40%
            (item.like_count * 0.3) +      // 좋아요 30%
            (item.bookmark_count * 0.2) +  // 북마크 20%
            (item.comment_count * 0.1)     // 댓글 10%
          )
        }))

        // 통계가 전혀 없는 작품 제외 (모두 0이면 제외)
        .filter(item =>
          item.view_count > 0 ||
          item.like_count > 0 ||
          item.bookmark_count > 0 ||
          item.comment_count > 0
        )

        // 종합 점수 기준 내림차순 정렬
        .sort((a, b) => b.totalScore - a.totalScore);

        setProjects(scoredData);  // 상태 업데이트
      })
      .catch((err) => {
        console.error('데이터 불러오기 에러:', err);  // 에러 출력
      });
  }, []);  // 최초 마운트 시 1회만 실행

  return (
    <div className="popular-projects-table">  {/* 전체 테이블 컨테이너 */}
      <h3>인기 작품 상세 테이블</h3>   {/* 표 제목 */}

      <div className="table-wrapper">  {/* 스크롤 적용 영역 */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>작품명</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>좋아요</th>
              <th>북마크</th>
              <th>댓글</th>
              <th>종합 점수</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((item, idx) => (
              <tr key={item.project_id}>     {/* 각 작품 행 */}
                <td>{idx + 1}</td>           {/* 순위 */}
                <td>{item.title}</td>        {/* 작품명 */}
                <td>{item.nickname || '알 수 없음'}</td>   {/* 작성자 */}
                <td>{item.view_count}</td>      {/* 조회수 */}
                <td>{item.like_count}</td>      {/* 좋아요 */}
                <td>{item.bookmark_count}</td>  {/* 북마크 */}
                <td>{item.comment_count}</td>   {/* 댓글 */}
                <td>{item.totalScore.toFixed(1)}</td>   {/* 종합 점수 (소수 1자리) */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PopularProjectsTable;
