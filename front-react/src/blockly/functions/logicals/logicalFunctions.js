import { imgArr, coordinates } from "../../blocks/blockGenerator";

const checkCollision = function(index, targetType, isClone = false) {
  const canvas = document.querySelector("canvas");
  if (!canvas) return false;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const cloneArr = window.cloneArr || [];
  const cloneObj = cloneArr[index];
  if (!cloneObj || cloneObj.hidden) return false;

  // 마우스와 충돌
  if (targetType === "mouse") {
    return (
      coordinates.x >= cloneObj.x &&
      coordinates.x <= cloneObj.x + cloneObj.width &&
      coordinates.y >= cloneObj.y &&
      coordinates.y <= cloneObj.y + cloneObj.height
    );
  }

  // 벽과 충돌
  else if (targetType === "wall") {
    return (
      cloneObj.x <= 0 ||
      cloneObj.y <= 0 ||
      cloneObj.x + cloneObj.width >= canvasWidth ||
      cloneObj.y + cloneObj.height >= canvasHeight
    );
  }

  // 특정 오브젝트(index)와 충돌
  else {
    const targetIndex = parseInt(targetType);
    const targetObj = imgArr.current[targetIndex];
    if (!targetObj || targetObj.hidden) return false;
  
    // 사각형을 원으로 변환: 중심 좌표와 반지름 계산
    const targetRadius = Math.min(targetObj.width, targetObj.height) / 2; // 사각형을 원으로 바꿔서 반지름 계산
    const targetCenterX = targetObj.x + targetObj.width / 2; // 사각형 중심 X 좌표
    const targetCenterY = targetObj.y + targetObj.height / 2; // 사각형 중심 Y 좌표
  
    // 클론 사각형을 원으로 변환: 중심 좌표와 반지름 계산
    const cloneRadius = Math.min(cloneObj.width, cloneObj.height) / 2; // 클론 사각형을 원으로 바꿔서 반지름 계산
    const cloneCenterX = cloneObj.x + cloneObj.width / 2; // 클론 중심 X 좌표
    const cloneCenterY = cloneObj.y + cloneObj.height / 2; // 클론 중심 Y 좌표
  
    // 두 원의 중심 간 거리 계산
    const distanceX = cloneCenterX - targetCenterX;
    const distanceY = cloneCenterY - targetCenterY;
    // 가로 차이 제곱 + 세로 차이 제곱 = 두 점 사이의 거리
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY); // 두원 중심간의 거리
  
    // 두 원이 충돌하는지 확인 (거리 <= 반지름 합)
    const isColliding = distance <= (cloneRadius + targetRadius); // 중심간의 거리가 반지름의 합보다 작거나 같을 때 닿았다
  
    return isColliding;
  }
};

window.checkCollision = checkCollision;
export default {
  checkCollision,
};
