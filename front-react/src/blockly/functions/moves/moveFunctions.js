import { imgArr, callImgArr } from '../../blocks/blockGenerator'; // 전역변수 스코프

// 방향과 거리로 이동
const moveInDirection = function (angle, distance, index) {
    if (typeof index === 'number' && imgArr.current[index]) {
      const radians = (Math.PI / 180) * (angle-90); // 0도 = 위쪽
      const dx = distance * Math.cos(radians);
      const dy = distance * Math.sin(radians);
  
      imgArr.current[index].x += dx;
      imgArr.current[index].y += dy;
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

const animationQueue = []; // animationQueue를 함수 내부에서 초기화하면, rotateImageInTime 함수가 호출될 때마다 새로운 큐가 생성되고 이전 큐는 덮어씌워진다.
// 입력시간 동안 이미지 회전
const rotateImageInTime= function (angle, duration, index) {
    if (typeof index !== 'number' || !imgArr.current[index]) {
        console.error('이미지 회전 실패: 인덱스 또는 이미지 객체가 유효하지 않습니다.');
        return;
    }
    animationQueue.push({ angle, duration, index }); // 애니메이션 큐, 애니메이션 정보를 저장할 배열(생성 & 초기화)
    if (animationQueue.length === 1) {
        runAnimation();
    }

    function runAnimation() {
        if (animationQueue.length === 0) { // shift 후 길이가 0이면 종료
        return;
        }

        const { angle, duration, index } = animationQueue[0]; // 구조 분해 할당
        const img = imgArr.current[index];
        const startTime = performance.now();
        const endTime = startTime + duration * 1000;
        const startAngle = img.angle;
        const endAngle = startAngle + angle;
        animate({
            img,
            startAngle,
            endAngle,
            duration,
            startTime,
            endTime,
          });  
    }
    function animate({ img, startAngle, endAngle, duration, startTime, endTime }) {
        if (animationQueue.length === 0) { 
            return;
        }
        const currentTime = performance.now();
        if (currentTime >= endTime) { // 애니메이션 완료
            img.angle = endAngle;
            callImgArr();
            animationQueue.shift();// 큐에서 현재 애니메이션 제거
            // .shift() :  배열의 첫 번째 요소를 제거하고, 제거된 요소를 반환
            runAnimation(); // 다음 애니메이션 실행
        } else { // 진행중
            
            const progress = (currentTime - startTime) / (duration * 1000); //  현재-시작시간/총 시간 = 진행률 (0~1사이의 값)
            img.angle = startAngle + (endAngle - startAngle) * progress; // 시작 + 입력각 * 진행률
            callImgArr();
            requestAnimationFrame(() =>
                animate({
                  img,
                  startAngle,
                  endAngle,
                  duration,
                  startTime,
                  endTime,
                })); // 다음 프레임에서 animate 함수 다시 호출
            // requestAnimationFrame : widow 전역 객체의 메서드, 애니메이션을 구현하며 콜백함수를 인자로 받아 호출
            //  콜백 함수는 브라우저가 다음 화면 갱신 시점에 실행되며, 애니메이션 효과를 업데이트하는 코드를 포함하여 부드러운 이미지 이동을 보여줌
            // 콜백 함수는 DOMHighResTimeStamp라는 하나의 매개변수를 자동으로 받습니다. ( 콜백 함수가 실행된 시점의 시간을 밀리초 단위로 나타내는 부동 소수점 숫자, 매 프레임마다 다른 값을 가짐 )
    
        }
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
    rotateImageInTime
  };
  
  window.moveImgToX = moveImgToX;
  window.moveImgToY = moveImgToY;
  window.moveImgToXY = moveImgToXY;
  window.moveInDirection = moveInDirection;
  window.changeCoordX = changeCoordX;
  window.changeCoordY = changeCoordY;
  window.rotateImage = rotateImage;
  window.rotateImageInTime = rotateImageInTime;