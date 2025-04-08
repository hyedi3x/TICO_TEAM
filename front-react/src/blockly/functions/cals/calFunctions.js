export let timerInterval;
export let elapsedTime = 0;

const startTimer = function () {
  elapsedTime = 0;
  window.elapsedTime = elapsedTime;

  const canvas = document.querySelector("canvas"); // canvasRef.current에 해당
  if (!canvas) {
    console.error("캔버스를 찾을 수 없습니다.");
    return;
  }
  const ctx = canvas.getContext("2d");

  function drawTimerText() {
    // 우상단에 타이머 그리기
    ctx.save();
    ctx.clearRect(canvas.width - 120, 10, 110, 40); // 이전 타이머 지우기
    ctx.font = "20px Arial";
    ctx.fillStyle = "#668493";
    ctx.fillText(`⏱ ${elapsedTime}s`, canvas.width - 80, 40);
    ctx.restore();
  }

  // 초기 1회 그림
  drawTimerText();

  // 초시계 시작
  timerInterval = setInterval(() => {
    elapsedTime++;
    window.elapsedTime = elapsedTime;
    drawTimerText();
  }, 1000);
};

const stopTimer = function () {
  clearInterval(timerInterval);
  console.log("⏱ 타이머 정지");
};

export default {
  startTimer,
  stopTimer
};

window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.elapsedTime = elapsedTime;