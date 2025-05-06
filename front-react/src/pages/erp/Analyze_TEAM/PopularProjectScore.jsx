import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS, // Chart.js 메인 엔진
  CategoryScale, // x축: 카테고리형 데이터 (작품명 등)
  LinearScale, // y축: 숫자형 데이터
  BarElement, // 막대 차트 요소
  Tooltip, // 마우스 오버 시 데이터 툴팁
  Legend, // 범례
} from "chart.js";

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const PopularProjectScore = () => {
  const [chartData, setChartData] = useState(null); // 차트 데이터 상태

  useEffect(() => {
    // 데이터 가져오기
    axios
      .get("/flask/popular-project-score-summary")
      .then((res) => {
        const data = res.data;

        // 작품별 종합 점수 계산 (각 항목별로 가중치를 적용해서 점수를 만듦)
        const scoredData = data.map((item) => {
          // 개별 항목별 점수 계산
          const viewScore = item.view_count * 0.4; // 조회수 × 0.4 (40% 반영)
          const likeScore = item.like_count * 0.3; // 좋아요 × 0.3 (30% 반영)
          const bookmarkScore = item.bookmark_count * 0.2; // 북마크 × 0.2 (20% 반영)
          const commentScore = item.comment_count * 0.1; // 댓글 × 0.1 (10% 반영)

          // 종합 점수 계산 (4개 항목의 합산)
          const totalScore =
            viewScore + likeScore + bookmarkScore + commentScore;

          // 기존 데이터 + 새로 계산한 점수들을 함께 리턴
          return {
            ...item, // 기존 데이터 복사 (title, id 등 유지)
            viewScore, 
            likeScore, 
            bookmarkScore, 
            commentScore, 
            totalScore, 
          };
        });

        // 통계가 전혀 없는 작품 제외 (조회수/좋아요/북마크/댓글 모두 0인 경우)
        const filtered = scoredData.filter((item) => item.totalScore > 0);

        // 전체 종합 점수 합계 구하기 (전체 작품 합산)
        const totalAllScore = filtered.reduce(
          (sum, item) => sum + item.totalScore,
          0
        );

        // 각 작품별로 전체 점수 대비 비율(%) 계산
        const withPercentage = filtered.map((item) => ({
          ...item,
          totalPercentage: (item.totalScore / totalAllScore) * 100,
        }));

        // 종합 점수 비율로 내림차순 정렬
        const sorted = withPercentage.sort(
          (a, b) => b.totalPercentage - a.totalPercentage
        );

        const labels = sorted.map((item) => item.title); // 작품명 리스트

        // 각 항목별 점수를 비율로 환산 (전체 점수 기준 비율)
        const viewPercentages = sorted.map(
          (item) => (item.viewScore / item.totalScore) * item.totalPercentage
        );
        const likePercentages = sorted.map(
          (item) => (item.likeScore / item.totalScore) * item.totalPercentage
        );
        const bookmarkPercentages = sorted.map(
          (item) =>
            (item.bookmarkScore / item.totalScore) * item.totalPercentage
        );
        const commentPercentages = sorted.map(
          (item) => (item.commentScore / item.totalScore) * item.totalPercentage
        );

        // Chart.js 데이터 구성
        setChartData({
          labels,
          datasets: [
            {
              label: "조회수(40%)",
              data: viewPercentages,
              backgroundColor: "#a2d2ff", // 파란색
            },
            {
              label: "좋아요수(30%)",
              data: likePercentages,
              backgroundColor: "#ffc8dd", // 핑크색
            },
            {
              label: "북마크수(20%)",
              data: bookmarkPercentages,
              backgroundColor: "#d8e2dc", // 카키색
            },
            {
              label: "댓글수(10%)",
              data: commentPercentages,
              backgroundColor: "#cdb4db", // 보라색
            },
          ],
        });
      });
  }, []); // 최초 마운트 시 실행

  // 차트 옵션 (전체 종합 점수 기준 비율)
  const options = {
    responsive: true, // 반응형 차트 (부모 요소 크기에 맞게 자동 조절)
    maintainAspectRatio: false, // true면 가로/세로 비율 고정됨 → false로 해서 높이 꽉 채움
    plugins: {
      legend: {
        position: "top", // 범례(데이터셋 라벨)를 차트 위쪽에 배치
      },
      tooltip: {
        callbacks: {
          // 툴팁 커스텀: 마우스 오버 시 나오는 라벨 포맷 지정
          label: (context) => {
            const label = context.dataset.label || ""; // 예: '조회수(40%)'
            const value = context.parsed.y; // 해당 데이터 포인트의 실제 값 (비율 %)
            return `${label}: ${value.toFixed(1)}%`; // 예: 조회수(40%): 12.5%
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true, // x축(작품명) 기준으로 데이터셋들이 누적되도록 스택형 막대 설정
        title: {
          display: true,
          text: "작품명", // x축 타이틀 (하단에 표시)
        },
        ticks: {
          autoSkip: false, // 작품명 라벨 생략 없이 모두 표시
          maxRotation: 45, // 긴 작품명일 경우 최대 45도 기울임
          minRotation: 45, // 최소도 45도 고정 (일관성 있게)
        },
      },
      y: {
        stacked: true, // y축도 누적해서 합산되도록 설정
        beginAtZero: true, // y축 0부터 시작
        title: {
          display: true,
          text: "전체 종합 점수 비율 (%)", // y축 타이틀 (좌측에 표시)
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      {chartData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div>로딩 중...</div>
      )}
    </div>
  );
};

export default PopularProjectScore;
