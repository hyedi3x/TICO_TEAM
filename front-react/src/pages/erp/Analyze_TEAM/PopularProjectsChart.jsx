import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,       // Chart.js 메인 엔진
  BarElement,             // 막대 차트 요소
  CategoryScale,          // 카테고리형 축 (작품명 등)
  LinearScale,            // 숫자형 축
  Legend,                 // 범례
  Tooltip,                // 툴팁
} from "chart.js";
import "./popularProjectsChart.css";

// Chart.js에서 사용할 모듈들을 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

const PopularProjectsChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // 두 API 호출 (절대 수치 + 종합 점수)
    Promise.all([
      axios.get("http://localhost:5000/flask/popular-projects"),              // 조회수/좋아요/북마크/댓글 등 절대 수치 가져오기
      axios.get("http://localhost:5000/flask/popular-project-score-summary"), // 종합 점수 가져오기 (순서용)
    ]).then(([projectsRes, scoreRes]) => {
      const rawData = projectsRes.data;      // 절대 수치 데이터
      const scoreData = scoreRes.data;       // 종합 점수 데이터

      // 종합 점수 순으로 정렬해서 같은 순서로 보여주기
      const sortedData = scoreData
        .map(orderItem => rawData.find(item => item.title === orderItem.title))
        .filter(Boolean)                      // null 방지 (데이터가 없으면 제외)
        .slice(0, 10);                        // 상위 10개만 보여줌

      const labels = sortedData.map(item => item.title); // 작품명 추출해서 라벨로 사용

      // Chart.js용 데이터셋 구성
      setChartData({
        labels,
        datasets: [
          {
            label: "조회수",
            data: sortedData.map(item => item.view_count),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
          {
            label: "좋아요 수",
            data: sortedData.map(item => item.like_count),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
          },
          {
            label: "북마크 수",
            data: sortedData.map(item => item.bookmark_count),
            backgroundColor: "rgba(255, 206, 86, 0.6)",
          },
          {
            label: "댓글 수",
            data: sortedData.map(item => item.comment_count),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
          },
        ],
      });
    }).catch(err => console.error("Axios 에러:", err));
  }, []);

  if (!chartData) return <div>로딩 중...</div>;  // 데이터 로딩 중 표시

  return (
    <div className="popular-projects-container">
      <div className="popular-projects-chart">
        <Bar
          data={chartData}
          options={{
            indexAxis: "y",             // 가로 막대 그래프로 표시
            responsive: true,           // 반응형
            maintainAspectRatio: false, // 부모 div의 높이에 맞춰 꽉 채움
            plugins: {
              legend: { position: "top" },  // 범례를 위쪽에 표시
            },
            scales: {
              y: {
                ticks: {
                  autoSkip: false, // 작품명 전부 보이게
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default PopularProjectsChart;
