import { extractTransformData } from "./common_moves"; // 공통적으로 쓸 코드(움직임, 회전율, 상하/좌우 반전 관련)

// 이동 방향과 거리 처리 (rotateX, rotateY 포함)
export const moveInDirection = (ID, angle, distance) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {

            // data-attribute에 좌표 및 요소 회전 각도(rotate) 저장 (처음 한 번만 - 사용자 지정 속성)
            if (!sprite.dataset.initialX || !sprite.dataset.initialY || !sprite.dataset.rotation
                || !sprite.dataset.scaleX || !sprite.dataset.scaleY) {
                
                const style = window.getComputedStyle(sprite).transform;
                if (style === 'none') return;  // transform 스타일이 없으면 종료

                const matrix = new DOMMatrix(style);
                sprite.dataset.initialX = matrix.e;
                sprite.dataset.initialY = matrix.f;
                sprite.dataset.rotation = 0;
                sprite.dataset.scaleX = matrix.a;
                sprite.dataset.scaleY = matrix.d;
            }

            // data-attribute에서 좌표 가져오기
            let currentX = parseFloat(sprite.dataset.initialX);
            let currentY = parseFloat(sprite.dataset.initialY);

            // 기존 회전 및 변환 값 유지
            let rotationDeg = parseFloat(sprite.dataset.rotation);

            // 기존 회전 각도 및 rotateX, rotateY 값 유지
            let currentScaleX = sprite.dataset.scaleX;
            let currentScaleY = sprite.dataset.scaleY;
            
            
            // 예외 처리: NaN인 경우 기본값 설정
            currentScaleX = isNaN(currentScaleX) ? 1 : currentScaleX;
            currentScaleY = isNaN(currentScaleY) ? 1 : currentScaleY;

            // 각도를 라디안으로 변환
            let radians = (Math.PI / 180) * parseFloat(${angle} - 90);

            // 이동 거리 계산
            let dx = parseFloat(${distance}) * Math.cos(radians);
            let dy = parseFloat(${distance}) * Math.sin(radians);

            // 새로운 위치 계산
            let newX = currentX + dx;
            let newY = currentY + dy;

            // 이동 적용
            sprite.style.transform = \`translate(\${newX}px, \${newY}px) rotate(\${rotationDeg}deg) scaleX(\${currentScaleX}) scaleY(\${currentScaleY})\`;

            // data-attribute 업데이트 (좌표와 회전 각도 저장)
            sprite.dataset.initialX = newX;
            sprite.dataset.initialY = newY;
        } 
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소의 X좌표를 입력값만큼 바꾸기 (rotateX, rotateY 포함)
export const moveCoordX = (ID, coordX) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {

            ${extractTransformData(`sprite`)}

            // 새로운 위치 설정
            let newX = currentX + ${coordX};

            // 이동 적용
            sprite.style.transform = \`translate(\${newX}px, \${currentY}px) rotate(\${rotationDeg}deg) scaleX(\${currentScaleX}) scaleY(\${currentScaleY})\`;

            // data-attribute 업데이트 (좌표와 회전 각도 저장)
            sprite.dataset.initialX = newX;
        } 
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소의 Y좌표를 입력값만큼 바꾸기 (rotateX, rotateY 포함)
export const moveCoordY = (ID, coordY) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {

            ${extractTransformData(`sprite`)}

            // 새로운 Y좌표는 y값을 감소시킴 (위로 이동)
            let newY = currentY - ${coordY};

            // 이동 적용
            sprite.style.transform = \`translate(\${currentX}px, \${newY}px) rotate(\${rotationDeg}deg) scaleX(\${currentScaleX}) scaleY(\${currentScaleY})\`;

            // data-attribute 업데이트 (좌표와 회전 각도 저장)
            sprite.dataset.initialY = newY;
        } 
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소의 X좌표를 변경하기
export const changeCoordX = (ID, coordX) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {

           ${extractTransformData(`sprite`)}

            // 새로운 X좌표 설정
            let newX = ${coordX};

            // 이동 적용
            sprite.style.transform = \`translate(\${newX}px, \${currentY}px) rotate(\${rotationDeg}deg) scaleX(\${currentScaleX}) scaleY(\${currentScaleY})\`;

            // data-attribute 업데이트 (좌표와 회전 각도 저장)
            sprite.dataset.initialX = newX;
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 요소의 Y좌표를 변경하기 
export const changeCoordY = (ID, coordY) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {

            ${extractTransformData(`sprite`)}

            // 새로운 Y좌표 설정
            let newY = ${coordY};

            // 이동 적용
            sprite.style.transform = \`translate(\${currentX}px, \${newY}px) rotate(\${rotationDeg}deg) scaleX(\${currentScaleX}) scaleY(\${currentScaleY})\`;

            // data-attribute 업데이트 (좌표와 회전 각도 저장)
            sprite.dataset.initialY = newY;
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};

// 회전하기
export const rotateElement = (ID, rotate) => {
    return `
        sprite = document.getElementById('${ID}');
        if (sprite) {

            ${extractTransformData(`sprite`)}

            // 새로운 회전 각도 = 기존 각도 + 추가 회전 값
            const newAngle = rotationDeg + parseFloat(${rotate});

            // 이동 적용 (회전만 변경)
            sprite.style.transform = \`translate(\${currentX}px, \${currentY}px) rotate(\${newAngle}deg) scaleX(\${currentScaleX}) scaleY(\${currentScaleY})\`;

            // data-attribute 업데이트 (좌표와 회전 각도 저장)
            sprite.dataset.rotation = newAngle;
        }
        else {
            alert("요소를 찾을 수 없습니다.");
        }\n`;
};