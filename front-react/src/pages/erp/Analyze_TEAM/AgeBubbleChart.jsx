// 필요한 라이브러리 import
import React, { useEffect, useState } from "react";  // React 훅
import { Bubble } from "react-chartjs-2";            // Bubble 차트 컴포넌트
import axios from "axios";                           // HTTP 요청 라이브러리

// 실제 나이별 분포도를 확인하기 위한 BubbleChart 컴포넌트 정의
const AgeBubbleChart = () => {
  // 버블 차트 데이터를 저장할 state
  const [bubbleData, setBubbleData] = useState([]);

  // 컴포넌트가 마운트되면 데이터 요청
  useEffect(() => {
    axios.get('http://localhost:5000/flask/subscription-age-bubble')
      .then(res => {
        console.log('[AgeBubbleChart] 응답 데이터:', res.data);
        setBubbleData(res.data); // 데이터 state에 저장
      })
      .catch(err => console.error('에러:', err)); 
  }, []);  // [] → 처음 마운트 시에만 실행됨

  // 데이터가 아직 없으면 로딩 메시지 출력
  if (!bubbleData || Object.keys(bubbleData).length === 0) return <div>로딩 중...</div>;

  // 그룹별 색상 정의 (각 연령대에 맞는 색상 지정)
  const colors = {
    "10대": "rgba(255, 99, 132, 0.5)",      // 빨간색 계열
    "20대": "rgba(54, 162, 235, 0.5)",      // 파란색 계열
    "30대": "rgba(75, 192, 192, 0.5)",      // 초록색 계열
    기타: "rgba(153, 102, 255, 0.5)",       // 보라색 계열
  };

  // datasets 생성 → Chart.js는 { label, data, backgroundColor } 형식 요구
  const datasets = Object.keys(bubbleData).map((group) => ({
    label: group,  // 범례 (ex: '10대', '20대',, )
    data: bubbleData[group],   // 해당 그룹의 버블 데이터 배열
    backgroundColor: colors[group] || "gray",   // 색상 (없는 그룹은 회색 처리)
  }));

  return (
    <Bubble
      data={{ datasets }}  // datasets 전달
      options={{
        scales: {  // scales : 차트의 축(axes)을 조정하는 옵션
          x: {
            min: 0,
            max: 50,    // x축: 0~50 (나이 전체범위)
            title: { display: true, text: "나이" }, // x축 제목
            grid: { display: false },  // x축 그리드 숨김
          },
          y: {
            min: 0,
            max: 9,   // y축: 0~9 (나이 일의 자리만 표시)
            title: { display: true, text: "나이 일의 자리 (y축)" }, // y축 제목
            grid: { display: false },    // y축 그리드 숨김
          },
        },
        // plugins : Chart.js의 확장 기능을 조정하는 옵션
        plugins: { legend: { position: "top" } },  // 범례를 위쪽에 표시
      }}
    />
  );
};

// 컴포넌트 export
export default AgeBubbleChart;
