import './projectDashboard.css';
import PopularProjectsChart from './PopularProjectsChart';
import PopularProjectScore from './PopularProjectScore';
import PopularProjectsTable from './PopularProjectsTable'; 

/*
 * ProjectDashboard 컴포넌트
 * - 인기 작품 관련 차트들을 보여주는 대시보드 페이지
 * - PopularProjectsChart: 작품별 조회수/좋아요/북마크/댓글 통계 차트
 * - PopularProjectScore: 종합 점수를 가중치 기준으로 환산한 차트
 */
const ProjectDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* 차트 카드들을 가로로 배치하는 래퍼 */}
      <div className="chart-wrapper">
        <div className="dashboard-card">
          <h2 className="dashboard-title">인기 작품 통계 분석(10개)</h2>
          <PopularProjectsChart />
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-title">작품별 종합 인기 점수 정유율(%)</h2>
          <PopularProjectScore />
        </div>
      </div>

      {/* 인기 점수 산출 기준 (범례 박스) */}
      <div className="legend-box">
        <strong>※ 인기점수 산출 기준:</strong><br />
        (조회수 × <span className="weight">0.4</span>) +
        (좋아요수 × <span className="weight">0.3</span>) +
        (북마크수 × <span className="weight">0.2</span>) +
        (댓글수 × <span className="weight">0.1</span>)
      </div>

      {/* 인기 작품 정보 테이블 */}
      <PopularProjectsTable />
    </div>
  );
};

export default ProjectDashboard;
