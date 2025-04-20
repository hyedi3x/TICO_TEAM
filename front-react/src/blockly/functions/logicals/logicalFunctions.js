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

    const isColliding = !(
      cloneObj.x + cloneObj.width < targetObj.x ||
      cloneObj.x > targetObj.x + targetObj.width ||
      cloneObj.y + cloneObj.height < targetObj.y ||
      cloneObj.y > targetObj.y + targetObj.height
    );

    return isColliding;
  }
};

window.checkCollision = checkCollision;
export default {
  checkCollision,
};
