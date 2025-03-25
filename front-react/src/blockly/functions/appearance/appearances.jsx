import { extractTransformData } from "../move/common_moves";
import { extractBubbleData, extractFilterData } from "./common_appearances"

// 요소 보이기
export const showObject = (ID) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {
            sprite.style.visibility = "visible"; // 보이기
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소 보이기
export const hideObject = (ID) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {
            sprite.style.visibility = "hidden"; // 보이기
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소 위에 계속해서 말풍선 띄우기
export const showBubble = (ID, text) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {
           ${extractBubbleData(`sprite`, text)}
        } else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소 위에 일정 시간 동안 말풍선 띄우기
export const showBubbleDuration = (ID, text, duration) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {
            ${extractBubbleData(`sprite`, text)};

            // 지정된 시간이 지나면 제거
            setTimeout(() => {
                bubble.remove();
            }, ${duration} * 1000);

            console.log("showBubbleDuration(${ID}, ${text}, ${duration})");
        } else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소 색상, 밝기, 투명도 조정
export const changeAppearance = (ID, property, value) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {
            ${extractFilterData(`sprite`)}

            // 색상 선택
            if ("${property}" === "color") {
                const hue = (${value} - 1) * 3.6;
                sprite.style.filter = \`hue-rotate(\${hue}deg) brightness(\${currentBrightness}%)\`;
                sprite.dataset.hue = hue;
            } 

            // 밝기 선택
            else if ("${property}" === "brightness") {
                const brightness = Math.min(200, Math.max(0, ${value} + 100));
                sprite.style.filter = \`hue-rotate(\${currentHue}deg) brightness(\${brightness}%)\`;
                sprite.dataset.brightness = brightness;
            } 

            // 투명도 선택
            else if ("${property}" === "opacity") {
                const opacityValue = Math.min(1, Math.max(0, ${value} / 100));
                sprite.style.opacity = \`\${opacityValue}\`;
            }
        } 
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 크기 변경(입력값만큼 크기 변경)
export const changeObject = (ID, size) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {
            // 요소의 원래 크기를 data-attribute에 저장 (처음 한 번만)
            if (!sprite.dataset.originalWidth || !sprite.dataset.originalHeight) {
                sprite.dataset.originalWidth = sprite.offsetWidth;
                sprite.dataset.originalHeight = sprite.offsetHeight;
            }

            // 원래 크기 가져오기
            const originalWidth = parseFloat(sprite.dataset.originalWidth);
            const originalHeight = parseFloat(sprite.dataset.originalHeight);

            // 변경할 크기 비율 계산
            const scaleFactor = parseFloat('${size}') / 100;
            const changeWidth = sprite.dataset.originalWidth * scaleFactor;
            const changeHeight = sprite.dataset.originalHeight * scaleFactor;

            const newWidth = sprite.offsetWidth + changeWidth;
            const newHeight = sprite.offsetHeight + changeHeight;

            // 크기 적용
            sprite.style.width = newWidth + 'px';
            sprite.style.height = newHeight + 'px';
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 크기 변경(입력값으로 크기 변경)
export const resizeObject = (ID, size) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {
            // 요소의 원래 크기를 data-attribute에 저장 (처음 한 번만)
            if (!sprite.dataset.originalWidth || !sprite.dataset.originalHeight) {
                const style = window.getComputedStyle(sprite);
                sprite.dataset.originalWidth = style.width;
                sprite.dataset.originalHeight = style.height;
            }

            // 원래 크기를 기준으로 새로운 크기 계산
            const originalWidth = parseFloat(sprite.dataset.originalWidth);
            const originalHeight = parseFloat(sprite.dataset.originalHeight);

            const newWidth = originalWidth * (parseFloat('${size}') / 100);
            const newHeight = originalHeight * (parseFloat('${size}') / 100);

            // 크기 적용
            sprite.style.width = newWidth + 'px';
            sprite.style.height = newHeight + 'px';
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 좌우/상하 반전
export const flipObject = (ID, direction) => {
    return `
        if(sprite){
            sprite = document.getElementById('${ID}');
            
            ${extractTransformData(`sprite`)};

            // 기존 transform 유지 (translate는 그대로 유지)
            let baseTransform = \`translate(\${currentX}px, \${currentY}px) rotate(\${rotationDeg}deg)\`;

            // 반전 적용 (horizontal과 vertical을 동시에 적용)
            if ("${direction}" === "horizontal") {
                let newScaleX = (currentScaleX === "1") ? -1 : 1;
                sprite.style.transform = \`\${baseTransform} scaleX(\${newScaleX}) scaleY(\${currentScaleY})\`;
                sprite.dataset.scaleX = newScaleX;
            } 
            else if ("${direction}" === "vertical") {
                let newScaleY = (currentScaleY === "1") ? -1 : 1;
                sprite.style.transform = \`\${baseTransform} scaleX(\${currentScaleX}) scaleY(\${newScaleY})\`;
                sprite.dataset.scaleY = newScaleY;
            }
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 모양 바꾸기
export const changeShape = (ID, shape) => {
    return `
        sprite = document.getElementById('${ID}');

        if (sprite){
            sprite.src = ${shape};
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

