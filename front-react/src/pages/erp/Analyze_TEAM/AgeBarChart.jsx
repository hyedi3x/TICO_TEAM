// 필요한 라이브러리 import
import React, { useEffect, useState } from 'react';  // React 훅 불러오기
import { Bar } from 'react-chartjs-2';               // Bar 차트 컴포넌트 불러오기
import axios from 'axios';                           // HTTP 요청 라이브러리

// 연령별 구독 분포를 확인하기 위한 BarChart 컴포넌트 정의
const AgeBarChart = () => {
  // 나이대별 데이터를 저장할 state (초기값 null)
  const [ageData, setAgeData] = useState(null);

  // 컴포넌트가 처음 마운트될 때 실행되는 useEffect 훅
  useEffect(() => {
    axios.get('/flask/subscription-age-summary')
      .then(res => setAgeData(res.data))             // 응답 데이터를 state에 저장
      .catch(err => console.error('에러:', err));    // 에러 발생 시 콘솔에 출력
  }, []);  // 빈 배열 → 컴포넌트 마운트 시 한 번만 실행됨

  // 데이터가 아직 로딩되지 않았다면 로딩 메시지 출력
  if (!ageData) return <div>로딩 중...</div>;

  // 가져온 데이터의 키와 값을 분리
  const labels = Object.keys(ageData);     // 연령대: ['10대', '20대', '30대']
  const values = Object.values(ageData);   // 구독 수

  // Chart.js에 전달할 데이터 객체
  const data = {
    labels,  // x축 라벨
    datasets: [
      {
        label: '구독 수',      // 범례에 표시될 라벨명
        data: values,          //  y축 데이터 (구독 수)
        backgroundColor: 'rgba(54, 162, 235, 0.6)',  // 막대 색상 (파란색 계열)
      },
    ],
  };

  // Bar 차트 렌더링
  return (
    <Bar
      data={data}  // 차트 데이터 전달
      options={{
        responsive: true,  // 반응형 차트 설정
        plugins: { 
          legend: { display: false }  // 범례 숨김 (막대 위쪽 라벨)
        },
        scales: {
          x: { grid: { display: false } },  // x축 그리드선 숨김
          y: { grid: { display: false } },  // y축 그리드선 숨김
        },
      }}
    />
  );
};

// 컴포넌트 export
export default AgeBarChart;
