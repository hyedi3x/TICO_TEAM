import './csDashboard.css';
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
// Chart.js 구성요소 가져오기
import {
  Chart as ChartJS,   // Chart.js 기본 객체
  BarElement,         // Bar(막대) 요소
  CategoryScale,      // x축 카테고리 스케일
  LinearScale,        // y축 선형 스케일
  Legend,             // 범례
  Tooltip,            // 툴팁
} from 'chart.js';
import axios from "axios";

// chart.js 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

const CsDashboard = () => {
  const [data, setData] = useState([]); // state: 데이터 배열 (초기값은 빈 배열)

  // 컴포넌트가 마운트되면 데이터 요청
  useEffect(() => {
    axios.get("/flask/dashboard-summary")
      .then(res => setData(res.data))
      .catch(err => console.error("Axios 에러:", err));
  }, []);


  // 차트에 사용할 데이터 구성
  const chartData = {
    labels: data.map(item => item.nickname),  // x축 라벨 (사용자 닉네임)
    datasets: [
      {
        label: "참여도(작품 만들기 참여)", 
        data: data.map(item => item.project_count),    // 참여도 데이터
        backgroundColor: "#abd2fa",  // 색상 (청록색 계열)
      },
      {
        label: "학습률 (블록 학습하기 참여)",  
        data: data.map(item => item.total_solved),     // 학습률 데이터
        backgroundColor: "#f2c6de", // 색상 (보라색 계열)
      }
    ]
  };

  return (
    <div className="cs-dashboard-container">
      <h2 className="cs-dashboard-title">사용자 참여도/학습률 분석</h2>
      <div className="cs-dashboard-chart">
        <Bar
          data={chartData}  // 차트 데이터 전달
          options={{
            maintainAspectRatio: false,  // 비율 유지하지 않고 높이/폭을 CSS에서 제어
            responsive: true,            // 반응형 차트
          }}
        />
      </div>
    </div>
  );
};

export default CsDashboard;
