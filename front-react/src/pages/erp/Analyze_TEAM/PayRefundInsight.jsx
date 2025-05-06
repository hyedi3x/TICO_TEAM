import "./payRefundInsight.css";

import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

// Chart.js 구성 요소
import {
  Chart as ChartJS,
  LineElement,      // 선(Line) 요소
  PointElement,     // 포인트(데이터 점) 요소
  CategoryScale,    // x축 카테고리 스케일
  LinearScale,      // y축 선형 스케일
  Legend,           // 범례
  Tooltip,          // 툴팁
} from "chart.js";

// Chart.js에 필요한 요소 등록 
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Legend, Tooltip);

// PayRefundInsight 컴포넌트 정의
const PayRefundInsight = () => {
  const [data, setData] = useState([]);
  const chartRef = useRef(null); 

  // 윈도우 리사이즈 시 차트를 강제로 리사이징 (크기가 꼬일 때 있음)
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();  // chart.js의 resize() 강제 호출
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 컴포넌트 마운트 시 데이터 가져오기 (결제/환불 인사이트)
  useEffect(() => {
    axios
      .get("http://localhost:5000/flask/payment-refund-insight")
      .then((res) => setData(res.data))  // 응답 데이터 state에 저장
      .catch((err) => console.error("Axios 에러:", err)); 
  }, []);

  // x축 라벨 (ex: '13시', '14시' ...)
  const labels = data.map((item) => `${item.hour}시`);

  // 차트 데이터 구성
  const chartData = {
    labels,  // x축 라벨
    datasets: [
      {
        label: "결제 수",
        data: data.map((item) => item.payment_count),
        fill: false,   // 밑부분은 채우지 않음 (기본 선 그래프)
        borderColor: "#90caf9", 
        tension: 0.1,  // 선의 부드러움 정도
        borderWidth: 1.5,     // 선 굵기 얇게
      },
      {
        label: "환불 수", 
        data: data.map((item) => item.refund_count),
        fill: false,
        borderColor: "#ff4d6d", 
        tension: 0.1,
        borderWidth: 1.5,     // 선 굵기 얇게
      },
    ],
  };

  // 렌더링
  return (
    <div className="pay-refund-insight">
      <div className="pay-refund-chart"> 
        <Line
          data={chartData}  // 차트 데이터 전달
          options={{
            maintainAspectRatio: false, // CSS로 크기 제어 (반응형 유지)
            responsive: true,           // 반응형 켜기
            resizeDelay: 0,             // 즉각 반응
            animation: false,           // 애니메이션 꺼서 렌더 중복 방지
            plugins: {
              legend: { position: "top" },  // 범례 위치
            },
          }}
        />
      </div>
    </div>
  );
};

export default PayRefundInsight;
