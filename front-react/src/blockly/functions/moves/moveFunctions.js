import { imgArr, callImgArr, coordinates } from '../../blocks/blockGenerator'; // 전역변수 스코프

// 이동 방향과 일치하는 방향으로 거리 이동
const moveInDirection = function (distance, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    // 💥 복제본이 삭제되어 존재하지 않을 수 있음 → 방어 처리
    if (!targetArr || typeof index !== 'number' || !targetArr[index]) {
      console.warn('moveInDirection: 유효하지 않은 index로 호출됨:', index);
      return; // 🚫 즉시 종료
    };

    const direction = targetArr[index].moveDirection;

    if (typeof index === 'number' && targetArr[index]) {
      const radians = (Math.PI / 180) * (direction-90); // 0도 = 위쪽
      const dx = distance * Math.cos(radians);
      const dy = distance * Math.sin(radians);

      targetArr[index].x = Number((targetArr[index].x + dx).toFixed(2));
      targetArr[index].y = Number((targetArr[index].y + dy).toFixed(2));
      callImgArr();
    } else {
      console.error('moveInDirection 실패: 유효하지 않은 index');
    }
};

// 이동 방향값 입력값으로 변경
const changeMoveDirection = function (moveDir, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
      targetArr[index].moveDirection = Number(moveDir);
      callImgArr();
    } else {
      console.error('changeMoveDirection 실패: 유효하지 않은 index');
    }
};

// 방향과 거리로 이동
const moveInDirectionAngle = function (angle, distance, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
      const radians = (Math.PI / 180) * (angle-90); // 0도 = 위쪽
      const dx = distance * Math.cos(radians);
      const dy = distance * Math.sin(radians);

      targetArr[index].x = Number((targetArr[index].x + dx).toFixed(2));
      targetArr[index].y = Number((targetArr[index].y + dy).toFixed(2));
      callImgArr();
    } else {
      console.error('moveInDirectionAngle 실패: 유효하지 않은 index');
    }
};

// X축 이미지 이동 함수 (인덱스 파라미터 유지)
const moveImgToX= function (x, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
      targetArr[index].x = Number(targetArr[index].x) + Number(x);
      callImgArr();
    } else {
      console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};

// Y축 이미지 이동 함수
const moveImgToY= function (y, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
        targetArr[index].y = Number(targetArr[index].y) + Number(y);
        callImgArr();
    } else {
        console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};

// X,Y축 이미지 이동 함수
const moveImgToXY= function (x, y, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
        targetArr[index].x = Number(targetArr[index].x) + Number(x);
        targetArr[index].y = Number(targetArr[index].y) + Number(y);
        callImgArr();
    } else {
        console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};

// X좌표 직접 설정
const changeCoordX = function (coordX, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
      targetArr[index].x = Number(coordX);
      callImgArr();
    } else {
      console.error('changeCoordX 실패');
    }
  };
  
  // Y좌표 직접 설정
const changeCoordY = function (coordY, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
      targetArr[index].y = Number(coordY);
      callImgArr();
    } else {
      console.error('changeCoordY 실패');
    }
};

  // X, Y좌표 직접 설정
  const changeCoordXY = function (coordX, coordY, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;
    
    if (typeof index === 'number' && targetArr[index]) {
      targetArr[index].x = Number(coordX);
      targetArr[index].y = Number(coordY);
      callImgArr();
    } else {
      console.error('changeCoordY 실패');
    }
  };

// 이미지 회전함수
const rotateImage = function (angle, index, isClone=false) {
    if (!window.running) return;
    const targetArr = isClone ? window.cloneArr : imgArr.current;

    if (typeof index === 'number' && targetArr[index]) {
        targetArr[index].angle += Number(angle);
        callImgArr();
    } else {
        console.error('이미지 회전 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};

// 입력시간 동안 이미지 회전
let isRotating = false; // 애니메이션 중복 방지 플래그
const rotateImageInTime= function (angle, duration, index, isClone=false) {
  if (!window.running) return;
  if (isRotating) return; // 애니메이션 중복 방지
  isRotating = true; // 애니메이션 시작
  const targetArr = isClone ? window.cloneArr : imgArr.current;
    
  return new Promise((resolve)=>{
    console.log('애니메이션 시작됨');
      runAnimation(angle, duration,index,resolve); // await rotateImageInTime(...)로 사용가능
  })

  
  function runAnimation(angle, duration,index,resolve) {
      
      const img = targetArr[index];
      const startTime = performance.now();
      const endTime = startTime + duration * 1000;
      const startAngle = img.angle;
      const endAngle = startAngle + angle;
      
      function animateFrame() {
        const now  = performance.now();
        if (now  >= endTime) { // 애니메이션 완료
            img.angle = endAngle;
            callImgArr();
            console.log('애니메이션 완료');
            isRotating = false; // 애니메이션 완료 후 플래그 초기화
            resolve(); // promise 완료
        } else { // 진행중
            const progress = (now  - startTime) / (duration * 1000); //  현재-시작시간/총 시간 = 진행률 (0~1사이의 값)
            img.angle = startAngle + (endAngle - startAngle) * progress; // 시작 + 입력각 * 진행률
            callImgArr();
            requestAnimationFrame(animateFrame); // 다음 프레임에서 animate 함수 다시 호출
          }
    }
    animateFrame();  // 첫 실행
  }   
};

const moveToMouse = function(index, isClone = false) {
  if (!window.running) return;
  const targetArr = isClone ? window.cloneArr : imgArr.current;

  if(typeof coordinates.x !== "number" || typeof coordinates.y !== "number") return;

  if(targetArr[index]){
    targetArr[index].x = coordinates.x - targetArr[index].width / 2;
    targetArr[index].y = coordinates.y - targetArr[index].height / 2;
    callImgArr();
  }
};

let isAnimating  = false; // 애니메이션 중복 방지 플래그
const moveImageInTime = function (x, y, duration, index) {
  if (!window.running) return;
  if (isAnimating ) return; // 애니메이션 중복 방지
  isAnimating  = true; // 애니메이션 시작
  return new Promise((resolve) => {
    console.log('이동 애니메이션 시작됨');
    runMoveAnimation(x, y, duration, index, resolve);
  });

  function runMoveAnimation(x, y, duration, index, resolve) {
    const img = imgArr.current[index];
    const startTime = performance.now();
    const endTime = startTime + duration * 1000;

    const startX = img.x;
    const startY = img.y;
    const endX = startX + Number(x);
    const endY = startY + Number(y);

    function animateFrame() {
      const now = performance.now();
      if (now >= endTime) {
        img.x = endX;
        img.y = endY;
        callImgArr();
        console.log('이동 애니메이션 완료');
        isAnimating = false; // 애니메이션 완료 후 플래그 초기화
        resolve(); // 애니메이션 완료
      } else {
        const progress = (now - startTime) / (duration * 1000); // 진행률 (0 ~ 1)
        img.x = startX + (endX - startX) * progress;
        img.y = startY + (endY - startY) * progress;
        callImgArr();
        requestAnimationFrame(animateFrame); // 다음 프레임 요청
      }
    }

    animateFrame(); // 첫 실행
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