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

const animationQueues = {}; // animationQueue를 함수 내부에서 초기화하면, rotateImageInTime 함수가 호출될 때마다 새로운 큐가 생성되고 이전 큐는 덮어씌워진다.
                           // 이미지 index별 고유한 큐를 생성해 독립적 시행
// 입력시간 동안 이미지 회전
const rotateImageInTime= function (angle, duration, index) {
  if(!animationQueues[index]) animationQueues[index]=[]; // js객체 key에 접근해서 없으면 빈배열
    
  return new Promise((resolve)=>{
    animationQueues[index].push({angle, duration, index, resolve}) //resolve는 작업 끝나면 호출, 이미지 별 큐

    if(animationQueues[index].length === 1){ // 큐의 인덱스에 주입되는 순간 실행 (.shift()로 다음 작업 처리해줌)
      runAnimation(index); // await rotateImageInTime(...)로 사용가능
    }
  })

  function runAnimation(index) {
      if (animationQueues[index].length === 0) { // shift 후 길이가 0이면 종료
      return;
      }
      // animationQueues[0]	index=0 이미지의 큐 (배열)
      // animationQueues[0][0]	현재 실행 중인 첫 번째 작업
      const { angle, duration, resolve } = animationQueues[index][0]; // 구조 분해 할당, 첫번째 작업을 가져옴
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
            animationQueues[index].shift();// 큐에서 현재 애니메이션 제거, 
            resolve(); // promise 완료
            // .shift() :  배열의 첫 번째 요소를 제거하고, 제거된 요소를 반환
            runAnimation(index); // 다음 애니메이션 실행
        } else { // 진행중
            
            const progress = (now  - startTime) / (duration * 1000); //  현재-시작시간/총 시간 = 진행률 (0~1사이의 값)
            img.angle = startAngle + (endAngle - startAngle) * progress; // 시작 + 입력각 * 진행률
            callImgArr();
            requestAnimationFrame(animateFrame); // 다음 프레임에서 animate 함수 다시 호출
            // requestAnimationFrame : 프레임마다 함수를 호출
            // setTimeout이나 setInterval도 쓸 수 있지만, 브라우저 최적화 측면에선 requestAnimationFrame()이 압도적으로 좋음
          }
    }
    animateFrame();  // 첫 실행
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