import './subScriptionInsight.css';

import { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 원 바깥에 텍스트 표시 

// Chart.js 구성 요소 가져오기
import {
  Chart as ChartJS,
  ArcElement,   // 도넛/파이 차트의 아크(원형) 요소
  Tooltip,      // 툴팁
  Legend,       // 범례
} from 'chart.js';

// Chart.js에 필요한 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const SubScriptionInsight = () => {
  const [summary, setSummary] = useState(null);

  // 컴포넌트 마운트 시 구독 요약 데이터 가져오기
  useEffect(() => {
    axios.get("http://localhost:5000/flask/subscription-summary")
      .then(res => {
        console.log("✅ 구독 요약 데이터:", res.data);
        setSummary(res.data);  // state에 데이터 저장
      })
      .catch(err => console.error("Axios 에러:", err));
  }, []);

  // 데이터가 아직 없으면 로딩 표시
  if (!summary) return <div>로딩 중...</div>;

  // 도넛 차트 데이터 #1: 현재 구독 중 비율
  const activeChartData = {
    labels: ["구독 중", "비구독"],
    datasets: [{
      data: [
        summary.active_subscribers,   // 구독 중인 사용자 수
        summary.total_users - summary.active_subscribers  // 비구독자 수
      ],
      backgroundColor: [  
        "#90caf9",   // 구독 중
        "rgba(201, 203, 207, 0.6)"   // 비구독: 회색 계열
      ],
      borderWidth: 1,  // 경계선 두께
    }]
  };

  // 도넛 차트 데이터 #2: 구독 취소 이력 비율
  const canceledChartData = {
    labels: ["구독 취소 이력 있음", "취소 이력 없음"],
    datasets: [{
      data: [
        summary.canceled_users,   // 취소 이력 있는 사용자
        summary.never_canceled_users   // 한 번도 취소 안 한 사용자
      ],
      backgroundColor: [ 
        "rgba(255, 99, 132, 0.6)",  // 취소 이력: 빨간색 계열
        "rgba(201, 203, 207, 0.6)"  // 없음: 회색 계열
      ],
      borderWidth: 1,
    }]
  };

  // 공통 옵션: datalabels 플러그인 사용
  const chartOptions = {
    plugins: {
      datalabels: {
        color: '#fff', // 밝은 배경 대비를 위해 흰색
        font: { size: 14, weight: 'bold' },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;  // 퍼센트만 표시
        },
        anchor: 'center',
        align: 'center',  // 도넛 내부 중앙에 배치
      },
      legend: { display: true },
      tooltip: { enabled: false }
    },
    maintainAspectRatio: false,
    responsive: true,
  };
  

  return (
    <div className="subscription-insight-container">
      <div className="subscription-chart-box">
        <h4 className="subscription-chart-title">현재 구독 중 비율</h4>
        <Doughnut data={activeChartData} options={chartOptions} plugins={[ChartDataLabels]} />
      </div>
      <div className="subscription-chart-box">
        <h4 className="subscription-chart-title">구독 취소 이력 비율</h4>
        <Doughnut data={canceledChartData} options={chartOptions} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
};

export default SubScriptionInsight;
