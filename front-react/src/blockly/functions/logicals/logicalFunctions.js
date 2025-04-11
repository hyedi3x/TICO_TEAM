import { imgArr, coordinates } from "../../blocks/blockGenerator";

const checkCollision = function(index, targetType, isClone = false) {
  const sourceArr = isClone ? window.cloneArr : imgArr.current;
  const sourceObj = sourceArr[index];
  if (!sourceObj) return false;

  // ✅ 마우스 충돌 처리
  if (targetType === "mouse") {
    return (
      coordinates.x >= sourceObj.x &&
      coordinates.x <= sourceObj.x + sourceObj.width &&
      coordinates.y >= sourceObj.y &&
      coordinates.y <= sourceObj.y + sourceObj.height
    );
  }

  // ✅ 벽 충돌 처리 (canvas 경계)
  if (targetType === "wall") {
    const canvas = document.querySelector("canvas");
    if (!canvas) return false;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const hitLeft = sourceObj.x <= 0;
    const hitRight = sourceObj.x + sourceObj.width >= canvasWidth;
    const hitTop = sourceObj.y <= 0;
    const hitBottom = sourceObj.y + sourceObj.height >= canvasHeight;

    return hitLeft || hitRight || hitTop || hitBottom;
  }

  // ✅ 기타 오브젝트 간 충돌 처리
  const allTargets = [...imgArr.current, ...(window.cloneArr || [])];

  for (let target of allTargets) {
    if (!target || target === sourceObj) continue;
    if (targetType === target.index?.toString()) {
      const isColliding = !(
        sourceObj.x + sourceObj.width < target.x ||
        sourceObj.x > target.x + target.width ||
        sourceObj.y + sourceObj.height < target.y ||
        sourceObj.y > target.y + target.height
      );
      if (isColliding) return true;
    }
  };

  return false;
};

export default {
  checkCollision,
};

window.checkCollision = checkCollision;