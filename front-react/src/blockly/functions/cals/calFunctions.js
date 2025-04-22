export let timerInterval;
export let elapsedTime;
export let showScore;

export function drawTimerText() {
  const canvas = document.querySelector("canvas");
  if (!canvas || !window.running) return;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.clearRect(canvas.width - 100, 10, 90, 25); // 캔바스의 해당부분을 지움
  ctx.font = "20px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText(`⏱ ${window.elapsedTime}s`, canvas.width - 90, 30);
  ctx.restore();
};

// window.score = 0;
export function drawScoreText() {
  const canvas = document.querySelector("canvas");
  if (!canvas || !window.running || !window.showScore) return;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.clearRect(10, 40, 120, 25); // 좌상단 아래쪽에 출력
  ctx.font = "20px Arial";
  ctx.fillStyle = "#1E90FF";
  ctx.fillText(`점수: ${window.score}`, 15, 60);
  ctx.restore(); // 변경된 ctx 속성 복원 
};

// 범위 내 랜덤 정수 생성
const mathRandomInt = function(min, max) {
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const startTimer = function () {
  if (!window.running) return;
  elapsedTime = 0;
  window.elapsedTime = elapsedTime;

  // 초기 1회 그림
  drawTimerText();

  // 초시계 시작
  timerInterval = setInterval(() => { // 1초마다 반복 실행
    if (!window.running) return;
    elapsedTime++;
    window.elapsedTime = elapsedTime;
    drawTimerText();
  }, 1000);
};

const stopTimer = function () {
  if (!window.running) return;
  clearInterval(timerInterval);
  console.log("⏱ 타이머 정지");
};

const startScore = function () {
  if (!window.running) return;
  window.score = 0;
  showScore = true;
  window.showScore = showScore;

  drawScoreText(); // 처음 1회 그리기
};

const controlScore = function(score){
  if (!window.running) return;
  window.score += score;
};

export default {
  mathRandomInt,
  startTimer,
  stopTimer,
  startScore,
  controlScore,
};

window.drawScoreText = drawScoreText;
window.drawTimerText = drawTimerText
window.mathRandomInt = mathRandomInt;
window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.startScore = startScore;
window.elapsedTime = elapsedTime;
window.showScore = showScore;
window.controlScore = controlScore;