import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from 'chart.js';
import axios from "axios";

// chart.js 요소 등록
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Legend, Tooltip);

const PayRefundInsight = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/flask/payment-refund-insight")
      .then(res => setData(res.data))
      .catch(err => console.error("Axios 에러:", err));
  }, []);

  const labels = data.map(item => `${item.hour}시`);

  const chartData = {
    labels,
    datasets: [
      {
        label: "결제 수",
        data: data.map(item => item.payment_count),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
      {
        label: "환불 수",
        data: data.map(item => item.refund_count),
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.1,
      }
    ]
  };

  return (
    <div>
      <h2>결제/환불 인사이트 (시간대별)</h2>
      <Line data={chartData} />
    </div>
  );
};

export default PayRefundInsight;
