import { callImgArr, imgArr } from "../../blocks/BlockGenerator";

// 요소 보이기
const showObject = function(index){
    if (imgArr.current[index]) {
      imgArr.current[index].hidden = false;
      callImgArr();
    }
};

// 요소 보이기
const hideObject = function(index){
    if (imgArr.current[index]) {
      imgArr.current[index].hidden = true;
      callImgArr();
    }
};

// 요소 색상, 밝기, 투명도 조정
const changeAppearance = function(property, value, index){
    const item = imgArr.current[index];
    if (!item) return;
  
    // 기본값 초기화
    item.hue = item.hue ?? 0;
    item.brightness = item.brightness ?? 100;
    item.opacity = item.opacity ?? 1;
  
    if (property === 'color') {
      const hue = (value - 1) * 3.6;
      item.hue = hue;
    } else if (property === 'brightness') {
      const brightness = Math.min(200, Math.max(0, value + 100));
      item.brightness = brightness;
    } else if (property === 'opacity') {
      const opacity = Math.min(1, Math.max(0, value / 100));
      item.opacity = opacity;
    }
  
    callImgArr();
};

// 크기 변경(입력값만큼 크기 변경)
const changeObject = function(sizeChangePercent, index){
    const item = imgArr.current[index];
    if (!item) return;
  
    // ✅ 원본 크기 한 번만 저장
    if (!item.originalWidth || !item.originalHeight) {
        item.originalWidth = item.width;
        item.originalHeight = item.height;
    }
  
    // 상대적인 변화량 계산
    const scaleFactor = sizeChangePercent / 100;
    item.width += item.originalWidth * scaleFactor;
    item.height += item.originalHeight * scaleFactor;
  
    callImgArr();
};
  

// 크기 변경(입력값으로 크기 변경)
const resizeObject = function(size, index){
    const item = imgArr.current[index];
    if (!item) return;

    // ✅ 원본 크기 한 번만 저장
    if (!item.originalWidth || !item.originalHeight) {
        item.originalWidth = item.width;
        item.originalHeight = item.height;
    }

    const factor = size / 100;
    item.width = item.originalWidth * factor;
    item.height = item.originalHeight * factor;

    callImgArr();
};

// 좌우/상하 반전
const flipObject = function(direction, index){
    if (imgArr.current[index]) {
      const item = imgArr.current[index];
      if (direction === 'horizontal') {
        item.flipX = !item.flipX;
      } else if (direction === 'vertical') {
        item.flipY = !item.flipY;
      }
      callImgArr();
    }
};

// 모양 바꾸기
const changeShape = function(url, index){
    if (imgArr.current[index]) {
      const newImg = new Image();
      newImg.src = url;
      newImg.onload = () => {
        imgArr.current[index].img = newImg;
        callImgArr();
      };
    }
};
export default {
    showObject,
    hideObject,
    changeAppearance,
    changeObject,
    resizeObject,
    flipObject,
    changeShape,
};

// ✅ window 객체 등록
window.showObject = showObject;
window.hideObject = hideObject;
window.changeAppearance = changeAppearance;
window.changeObject = changeObject;
window.resizeObject = resizeObject;
window.flipObject = flipObject;
window.changeShape = changeShape;