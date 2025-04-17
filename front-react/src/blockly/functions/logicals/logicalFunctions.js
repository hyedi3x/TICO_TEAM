import { imgArr, coordinates, callImgArr } from "../../blocks/blockGenerator";

const checkCollision = function(index, targetType, isClone = false) {
  const canvas = document.querySelector("canvas");
  if (!canvas || !window.cloneArr) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  for (let i = window.cloneArr.length - 1; i >= 0; i--) {
    const cloneObj = window.cloneArr[i];
    if (!cloneObj || cloneObj.hidden) continue;

    // ✅ 마우스와 충돌
    if (targetType === "mouse") {
      const hit =
        coordinates.x >= cloneObj.x &&
        coordinates.x <= cloneObj.x + cloneObj.width &&
        coordinates.y >= cloneObj.y &&
        coordinates.y <= cloneObj.y + cloneObj.height;

      if (hit) {
        console.log("🖱 마우스에 닿은 복제본 삭제:", i);
        window.cloneArr.splice(i, 1);
        window.score += 1; // 충돌 시 점수 증가
      }
    }

    // ✅ 벽과 충돌
    else if (targetType === "wall") {
      const hitWall =
        cloneObj.x <= 0 ||
        cloneObj.y <= 0 ||
        cloneObj.x + cloneObj.width >= canvasWidth ||
        cloneObj.y + cloneObj.height >= canvasHeight;

      if (hitWall) {
        console.log("🧱 벽에 닿은 복제본 삭제:", i);
        window.cloneArr.splice(i, 1);
      }
    }

    // ✅ 특정 오브젝트(index)와 충돌
    else {
      const targetIndex = parseInt(targetType);
      const targetObj = imgArr.current[targetIndex];

      if (!targetObj || targetObj.hidden) continue;

      const isColliding = !(
        cloneObj.x + cloneObj.width < targetObj.x ||
        cloneObj.x > targetObj.x + targetObj.width ||
        cloneObj.y + cloneObj.height < targetObj.y ||
        cloneObj.y > targetObj.y + targetObj.height
      );
      
      if (isColliding) {
        console.log(`📦 ${targetIndex}번 오브젝트와 충돌한 복제본 삭제:`, i);
        window.cloneArr.splice(i, 1);
        window.score += 1; // 충돌 시 점수 증가
      }
    }
  }

  // index 재정렬
  window.cloneArr.forEach((obj, i) => {
    obj.index = i;
  });

  callImgArr();
};
window.checkCollision = checkCollision;
export default {
  checkCollision,
};
