import { imgArr, callImgArr } from '../../blocks/blockGenerator'; // 전역변수 스코프

// 방향과 거리로 이동
const moveInDirection = function (angle, distance, index) {
    if (typeof index === 'number' && imgArr.current[index]) {
      const radians = (Math.PI / 180) * (angle-90); // 0도 = 위쪽
      const dx = distance * Math.cos(radians);
      const dy = distance * Math.sin(radians);

      imgArr.current[index].x = Number((imgArr.current[index].x + dx).toFixed(2));
      imgArr.current[index].y = Number((imgArr.current[index].y + dy).toFixed(2));
      callImgArr();
    } else {
      console.error('moveInDirection 실패: 유효하지 않은 index');
    }
};

// X축 이미지 이동 함수 (인덱스 파라미터 유지)
const moveImgToX= function (x, index) {
    // imgArr.current[index]가 null이나 undefined가 아닌지 확인
    // index 변수의 데이터 타입이 number인지 확인
    if (typeof index === 'number' && imgArr.current[index]) {
      imgArr.current[index].x = Number(imgArr.current[index].x) + Number(x);
      callImgArr();
    } else {
      console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};

// Y축 이미지 이동 함수
const moveImgToY= function (y, index) {
    if (typeof index === 'number' && imgArr.current[index]) {
        imgArr.current[index].y = Number(imgArr.current[index].y) + Number(y);
        callImgArr();
    } else {
        console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};

// X,Y축 이미지 이동 함수
const moveImgToXY= function (x, y, index) {
    if (typeof index === 'number' && imgArr.current[index]) {
        imgArr.current[index].x = Number(imgArr.current[index].x) + Number(x);
        imgArr.current[index].y = Number(imgArr.current[index].y) + Number(y);
        callImgArr();
    } else {
        console.error('이미지 이동 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};

// X좌표 직접 설정
const changeCoordX = function (coordX, index) {
    if (typeof index === 'number' && imgArr.current[index]) {
      imgArr.current[index].x = Number(coordX);
      callImgArr();
    } else {
      console.error('changeCoordX 실패');
    }
  };
  
  // Y좌표 직접 설정
  const changeCoordY = function (coordY, index) {
    if (typeof index === 'number' && imgArr.current[index]) {
      imgArr.current[index].y = Number(coordY);
      callImgArr();
    } else {
      console.error('changeCoordY 실패');
    }
  };

// 이미지 회전함수
const rotateImage = function (angle, index) {
    if (typeof index === 'number' && imgArr.current[index]) {
        imgArr.current[index].angle = Number(imgArr.current[index].angle) + Number(angle);
        callImgArr();
    } else {
        console.error('이미지 회전 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
    }
};


const rotateImageInTime= function (angle, duration, index) {

  return new Promise((resolve)=>{
    console.log('애니메이션 시작됨');
      runAnimation(angle, duration,index,resolve); // await rotateImageInTime(...)로 사용가능

  })

  function runAnimation(angle, duration,index,resolve) {
      const img = imgArr.current[index];
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

const moveImageInTime = function (x, y, duration, index) {
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


export {
    moveImgToX,
    moveImgToY,
    moveImgToXY,
    moveInDirection,
    changeCoordX,
    changeCoordY,
    rotateImage,
    rotateImageInTime,
    moveImageInTime,
  };
  
  window.moveImgToX = moveImgToX;
  window.moveImgToY = moveImgToY;
  window.moveImgToXY = moveImgToXY;
  window.moveInDirection = moveInDirection;
  window.changeCoordX = changeCoordX;
  window.changeCoordY = changeCoordY;
  window.rotateImage = rotateImage;
  window.rotateImageInTime = rotateImageInTime;
  window.moveImageInTime = moveImageInTime;