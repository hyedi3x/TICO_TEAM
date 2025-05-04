import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js';
import axios from "axios";

// chart.js 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

const CsDashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/flask/dashboard-summary")
      .then(res => setData(res.data))
      .catch(err => console.error("Axios 에러:", err));
  }, []);

  const chartData = {
    labels: data.map(item => item.nickname),
    datasets: [
      {
        label: "참여도(작품 만들기 참여)",
        data: data.map(item => item.project_count),
        backgroundColor: "rgba(75, 192, 192, 0.6)"
      },
      {
        label: "학습률 (블록 학습하기 참여)",
        data: data.map(item => item.total_solved),
        backgroundColor: "rgba(153, 102, 255, 0.6)"
      }
    ]
  };

  return (
    <div>
      <h2>사용자 대시보드</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default CsDashboard;
