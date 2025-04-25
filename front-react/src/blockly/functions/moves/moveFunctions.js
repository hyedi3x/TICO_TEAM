import { imgArr, callImgArr, coordinates } from '../../blocks/blockGenerator'; // 전역변수 스코프

// 벽제한 두기
// x값이 0보다 작으면 0을 반환, 500-width(벽에 붙은 상태) 보다 크다면 해당 값을 반환
function clampToCanvas(x, y, width = 0, height = 0) {
  const clampedX = Math.min(Math.max(x, 0), 500 - width);
  const clampedY = Math.min(Math.max(y, 0), 500 - height);
  return { x: clampedX, y: clampedY };
}

// 이동 방향과 일치하는 방향으로 거리 이동
const moveInDirection = function (distance, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  // 💥 복제본이 삭제되어 존재하지 않을 수 있음 → 방어 처리
  if (!targetArr || typeof index !== 'number' || !targetArr[index]) {
    console.warn('moveInDirection: 유효하지 않은 index로 호출됨:', index);
    return; // 🚫 즉시 종료
  }

  const direction = targetArr[index].moveDirection;

  if (typeof index === 'number' && targetArr[index]) {
    const radians = (Math.PI / 180) * (direction - 90); // 0도 = 위쪽
    const dx = distance * Math.cos(radians);
    const dy = distance * Math.sin(radians);
    const cur = targetArr[index];
    const nextX = Number((cur.x + dx).toFixed(2));
    const nextY = Number((cur.y + dy).toFixed(2));
    const { x: clampedX, y: clampedY } = clampToCanvas(nextX, nextY, cur.width, cur.height);
    cur.x = clampedX;
    cur.y = clampedY;
    callImgArr();
  } else {
    console.error('moveInDirection 실패: 유효하지 않은 index');
  }
};

// 이동 방향값 입력값으로 변경
const changeMoveDirection = function (moveDir, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    targetArr[index].moveDirection = Number(moveDir);
    callImgArr();
  } else {
    console.error('changeMoveDirection 실패: 유효하지 않은 index');
  }
};

// 방향과 거리로 이동
const moveInDirectionAngle = function (angle, distance, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    const radians = (Math.PI / 180) * (angle - 90); // 0도 = 위쪽
    const dx = distance * Math.cos(radians);
    const dy = distance * Math.sin(radians);
    const cur = targetArr[index];
    const nextX = Number((cur.x + dx).toFixed(2));
    const nextY = Number((cur.y + dy).toFixed(2));
    const { x: clampedX, y: clampedY } = clampToCanvas(nextX, nextY, cur.width, cur.height);
    cur.x = clampedX;
    cur.y = clampedY;
    callImgArr();
  } else {
    console.error('moveInDirectionAngle 실패: 유효하지 않은 index');
  }
};

// X축 이미지 이동 함수 (인덱스 파라미터 유지)
const moveImgToX = function (x, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    const cur = targetArr[index];
    const nextX = Number(cur.x) + Number(x);
    const { x: clampedX } = clampToCanvas(nextX, cur.y, cur.width, cur.height);
    cur.x = clampedX;
    callImgArr();
  } else {
    console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
  }
};

// Y축 이미지 이동 함수
const moveImgToY = function (y, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    const cur = targetArr[index];
    const nextY = Number(cur.y) + Number(y);
    const { y: clampedY } = clampToCanvas(cur.x, nextY, cur.width, cur.height);
    cur.y = clampedY;
    callImgArr();
  } else {
    console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
  }
};

// X,Y축 이미지 이동 함수
const moveImgToXY = function (x, y, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    const cur = targetArr[index];
    const nextX = Number(cur.x) + Number(x);
    const nextY = Number(cur.y) + Number(y);
    const { x: clampedX, y: clampedY } = clampToCanvas(nextX, nextY, cur.width, cur.height);
    cur.x = clampedX;
    cur.y = clampedY;
    callImgArr();
  } else {
    console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
  }
};

// X좌표 직접 설정
const changeCoordX = function (coordX, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    const cur = targetArr[index];
    const { x: clampedX } = clampToCanvas(Number(coordX), cur.y, cur.width, cur.height);
    cur.x = clampedX;
    callImgArr();
  } else {
    console.error('changeCoordX 실패');
  }
};

// Y좌표 직접 설정
const changeCoordY = function (coordY, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    const cur = targetArr[index];
    const { y: clampedY } = clampToCanvas(cur.x, Number(coordY), cur.width, cur.height);
    cur.y = clampedY;
    callImgArr();
  } else {
    console.error('changeCoordY 실패');
  }
};

// X, Y좌표 직접 설정
const changeCoordXY = function (coordX, coordY, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    const cur = targetArr[index];
    const { x: clampedX, y: clampedY } = clampToCanvas(Number(coordX), Number(coordY), cur.width, cur.height);
    cur.x = clampedX;
    cur.y = clampedY;
    callImgArr();
  } else {
    console.error('changeCoordY 실패');
  }
};

// 이미지 회전함수
const rotateImage = function (angle, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof index === 'number' && targetArr[index]) {
    targetArr[index].angle += Number(angle);
    callImgArr();
  } else {
    console.error('이미지 회전 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
  }
};

// 입력시간 동안 이미지 회전
const rotateImageInTime = function (angle, duration, index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  // ------ 오브젝트별 플래그로 중복 방지 ------
  const img = targetArr[index];
  if (!img) return;
  if (img.isRotating) return;   // 개별 객체 애니메이션 중복 방지
  img.isRotating = true;        // 시작

  return new Promise((resolve) => {
    console.log('애니메이션 시작됨');
    runAnimation(angle, duration, img, resolve); // await rotateImageInTime(...)로 사용가능
  });

  // ------ 내부 애니메이션 함수 ------
  function runAnimation(angle, duration, img, resolve) {
    const startTime = performance.now();
    const endTime = startTime + duration * 1000;
    const startAngle = img.angle;
    const endAngle = startAngle + angle;

    let pauseStarted = null; // 일시정지 들어간 순간(ms)
    let pauseElapsed = 0;    // 일시정지로 멈췄던 전체 시간(ms)

    function animateFrame() {
      // ---- 정지: 즉시 종료 ----
      if (!window.running) {
        img.isRotating = false;
        resolve();
        return;
      }
      // ---- 일시정지: pause 시작 시간 기록, 프레임만 예약 ----
      if (window.isPaused) {
        if (!pauseStarted) pauseStarted = performance.now();
        requestAnimationFrame(animateFrame);
        return;
      }
      // ---- 일시정지 해제: 누적 일시정지 시간 계산 ----
      if (pauseStarted) {
        pauseElapsed += performance.now() - pauseStarted;
        pauseStarted = null;
      }

      const now = performance.now();
      const effectiveNow = now - pauseElapsed; // 실제 진행 시간 반영
      if (effectiveNow >= endTime) { // 완료
        img.angle = endAngle;
        callImgArr();
        img.isRotating = false;
        resolve();
      } else {
        const progress = (effectiveNow - startTime) / (duration * 1000);
        img.angle = startAngle + (endAngle - startAngle) * progress;
        callImgArr();
        requestAnimationFrame(animateFrame);
      }
    }
    animateFrame();  // 첫 실행
  }
};

// 마우스 위치로 이동
const moveToMouse = function(index, isClone = false) {
  if (!window.running || window.isPaused) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if (typeof coordinates.x !== "number" || typeof coordinates.y !== "number") return;

  if (targetArr[index]) {
    const cur = targetArr[index];
    const nextX = coordinates.x - cur.width / 2;
    const nextY = coordinates.y - cur.height / 2;
    const { x: clampedX, y: clampedY } = clampToCanvas(nextX, nextY, cur.width, cur.height);
    cur.x = clampedX;
    cur.y = clampedY;
    callImgArr();
  }
};

// 입력시간 동안 위치 이동
const moveImageInTime = function (x, y, duration, index, isClone = false) {
  if (!window.running || window.isPaused) return;

  const targetArr = isClone ? window.cloneArr : imgArr.current;
  const img = targetArr[index];
  if (!img) return;

  // 개별 객체에 isAnimating 속성 붙이기
  // 자기만의 isAnimating을 갖고 독립적으로 움직인다.
  img.isAnimating = img.isAnimating || false;
  if (img.isAnimating) return;       // 현재 이 객체만 검사
  img.isAnimating = true;            // 이 객체만 애니메이션 시작

  return new Promise((resolve) => {
    runMoveAnimation(x, y, duration, img, resolve);
  });

  // 내부 실제 애니메이션 함수
  function runMoveAnimation(x, y, duration, img, resolve) {
    const startTime = performance.now();
    const endTime = startTime + duration * 1000;

    const startX = img.x;
    const startY = img.y;
    const endX = startX + Number(x);
    const endY = startY + Number(y);

    let pauseStarted = null; // 일시정지 진입한 시점(ms)
    let pauseElapsed = 0;    // 일시정지 총 누적(ms)

    function animateFrame() {
      // 완전 정지(정지 버튼) 시 즉시 종료
      if (!window.running) {
        img.isAnimating = false;
        resolve();
        return;
      }
      // 일시정지: 진입시점만 기록하고, 프레임 예약만 반복
      if (window.isPaused) {
        if (!pauseStarted) pauseStarted = performance.now();
        requestAnimationFrame(animateFrame);
        return;
      }
      // 일시정지 해제: 누적 일시정지 시간 반영
      if (pauseStarted) {
        pauseElapsed += performance.now() - pauseStarted;
        pauseStarted = null;
      }

      const now = performance.now();
      const effectiveNow = now - pauseElapsed; // 실제 진행 시간

      if (effectiveNow >= endTime) {
        // 마지막 프레임에 벽 보정 적용
        const { x: clampedX, y: clampedY } = clampToCanvas(endX, endY, img.width, img.height);
        img.x = clampedX;
        img.y = clampedY;
        callImgArr();
        img.isAnimating = false;
        resolve();
      } else {
        const progress = (effectiveNow - startTime) / (duration * 1000);
        const newX = startX + (endX - startX) * progress;
        const newY = startY + (endY - startY) * progress;
        const { x: clampedX, y: clampedY } = clampToCanvas(newX, newY, img.width, img.height);
        img.x = clampedX;
        img.y = clampedY;
        callImgArr();
        requestAnimationFrame(animateFrame);
      }
    }

    animateFrame();
  }
};

export default {
  moveInDirection,
  changeMoveDirection,
  moveInDirectionAngle,
  moveImgToX,
  moveImgToY,
  moveImgToXY,
  changeCoordX,
  changeCoordY,
  changeCoordXY,
  rotateImage,
  rotateImageInTime,
  moveToMouse,
  moveImageInTime
};

window.moveInDirection = moveInDirection;
window.changeMoveDirection = changeMoveDirection;
window.moveInDirectionAngle = moveInDirectionAngle;
window.moveImgToX = moveImgToX;
window.moveImgToY = moveImgToY;
window.moveImgToXY = moveImgToXY;
window.changeCoordX = changeCoordX;
window.changeCoordY = changeCoordY;
window.changeCoordXY = changeCoordXY;
window.rotateImage = rotateImage;
window.rotateImageInTime = rotateImageInTime;
window.moveToMouse = moveToMouse;
window.moveImageInTime = moveImageInTime;
