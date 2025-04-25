// --------- 전역 상태 초기화 ---------
window.timerInterval = null;   // 초시계 setInterval ID
window.elapsedTime = 0;        // 초시계 경과 시간
window.score = -1;              // 점수
window.showScore = false;      // 점수 출력 여부
window.scoreInterval = null;   // 점수 표시용 setInterval ID (추가: 중복 방지용)

// --------- 타이머 텍스트(캔버스에 초시계) 출력 ---------
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

// --------- 점수 텍스트(캔버스에 점수) 출력 ---------
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

// --------- 범위 내 랜덤 정수 생성 ---------
const mathRandomInt = function(min, max) {
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// --------- 초시계 시작/일시정지/재시작 ---------
const startTimer = function () {
  // 기존 타이머 중복 방지
  if (window.timerInterval) {
    clearInterval(window.timerInterval);
    delete window.timerInterval; // 완전히 삭제
  }

  // 완전 정지 상태에서만 0부터 시작
  if (!window.running) {
    window.elapsedTime = 0;
  }

  drawTimerText();

  window.timerInterval = setInterval(() => {
    if (!window.running) {
      clearInterval(window.timerInterval); // 완전 정지 시 인터벌 해제
      delete window.timerInterval;
      window.elapsedTime = 0;
      drawTimerText();
      return;
    }
    if (window.isPaused) {
      // 일시정지면 시간 증가 없이 대기 (타이머 멈춤)
      return;
    }
    window.elapsedTime++;
    drawTimerText();
  }, 1000);
};

// --------- 초시계 멈춤(정지) ---------
const stopTimer = function () {
  window.running = false;    // 타이머 종료 상태로 설정
  window.isPaused = false;   // 일시정지 해제

  // 언제든 running false면 타이머 변수/상태 모두 초기화
  if (window.timerInterval) {
    clearInterval(window.timerInterval);  // 타이머 종료
    delete window.timerInterval; // 변수 자체를 완전히 삭제
  }
  window.elapsedTime = 0;   // 타이머 초기화 추가!
  drawTimerText();          // 0초를 다시 그려주기

  // 점수 인터벌도 같이 정리 (추가!)
  if (window.scoreInterval) {
    clearInterval(window.scoreInterval);
    delete window.scoreInterval;
  }
  window.showScore = false;
  console.log("타이머 종료");
};

// --------- 점수 초기화 및 첫 출력 ---------
const startScore = function () {
  if (!window.running || window.isPaused) return;

  // 기존 값/interval 삭제 후 재생성 (완전 리셋)
  if ('score' in window) delete window.score;
  if ('showScore' in window) delete window.showScore;
  if (window.scoreInterval) {
    clearInterval(window.scoreInterval);
    delete window.scoreInterval;
  }

  window.score = -1;
  window.showScore = true;
  drawScoreText(); // 처음 1회 그리기

  // 점수 주기적 표시(중복 등록 방지)
  window.scoreInterval = setInterval(() => {
    if (!window.running || !window.showScore) {
      clearInterval(window.scoreInterval);
      delete window.scoreInterval;
      return;
    }
    drawScoreText();
  }, 100); // 0.1초마다 갱신
};

// --------- 점수 누적 ---------
const controlScore = function(score){
  if (!window.running || window.isPaused) {
    window.score = -1;
    return;
  }
  window.score += score;
};

// --------- 내보내기 ---------
export default {
  mathRandomInt,
  startTimer,
  stopTimer,
  startScore,
  controlScore,
};

// --------- window 객체에 함수/상태 연결 ---------
window.drawScoreText = drawScoreText;
window.drawTimerText = drawTimerText;
window.mathRandomInt = mathRandomInt;
window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.startScore = startScore;
window.controlScore = controlScore;
