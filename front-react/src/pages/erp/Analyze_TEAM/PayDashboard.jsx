import './payDashboard.css';

import PayRefundInsight from './PayRefundInsight';        // 결제/환불 인사이트 컴포넌트
import SubscriptionInsight from './SubScriptionInsight';  // 구독 현황 컴포넌트
import AgeBarChart from './AgeBarChart';                  // 연령대별 구독 Bar 차트
import AgeBubbleChart from './AgeBubbleChart';            // 연령대 산점도 Bubble 차트

// PayDashboard 컴포넌트 정의
const PayDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* 왼쪽 영역: 결제/환불 + 구독 현황 */}
      <div className="dashboard-left">
        <div className="dashboard-card">
          <h2 className="dashboard-title">결제/환불 인사이트 (시간대별)</h2>
          <PayRefundInsight />
        </div>
        <div className="dashboard-card">
          <h2 className="dashboard-title">구독 현황</h2>
          <SubscriptionInsight />
        </div>
      </div>

      {/* 오른쪽 영역: 연령대별 차트 */}
      <div className="dashboard-right">
        <div className="dashboard-card">
          <h2 className="dashboard-title">연령대별 구독 현황</h2>
          <AgeBarChart /> 
        </div>
        <div className="dashboard-card">
          <h2 className="dashboard-title">연령대 산점도</h2>
          <AgeBubbleChart />
        </div>
      </div>
    </div>
  );
};

export default PayDashboard;
