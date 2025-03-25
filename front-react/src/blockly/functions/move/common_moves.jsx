/*
    움직임(moves.js), 상하/좌우 반전(appearance.js)에 공통적으로 들어가는 코드
    HTML 요소의 transform 스타일에서 필요한 정보를 추출하는 JavaScript 코드를 생성하는 함수
    sprite: 정보를 추출할 HTML 요소의 ID 또는 요소 자체를 나타내는 매개변수
*/

export const extractTransformData = (sprite) => {
    return `
        // data-attribute에 좌표 및 요소 회전 각도(rotate) 저장 (처음 한 번만 - 사용자 지정 속성)
        if (!${sprite}.dataset.initialX || !${sprite}.dataset.initialY || !${sprite}.dataset.rotation
            || !${sprite}.dataset.scaleX || !${sprite}.dataset.scaleY) {
            
            const style = window.getComputedStyle(${sprite}).transform;
            if (style === 'none') return;  // transform 스타일이 없으면 종료

            const matrix = new DOMMatrix(style);
            ${sprite}.dataset.initialX = matrix.e;
            ${sprite}.dataset.initialY = matrix.f;
            ${sprite}.dataset.rotation = 0;
            ${sprite}.dataset.scaleX = matrix.a;
            ${sprite}.dataset.scaleY = matrix.d;
        }

        // data-attribute에서 좌표 가져오기
        let currentX = parseFloat(${sprite}.dataset.initialX);
        let currentY = parseFloat(${sprite}.dataset.initialY);

        // 기존 회전 및 변환 값 유지
        let rotationDeg = parseFloat(${sprite}.dataset.rotation);

        // 기존 회전 각도 및 rotateX, rotateY 값 유지
        let currentScaleX = ${sprite}.dataset.scaleX;
        let currentScaleY = ${sprite}.dataset.scaleY;
        
        
        // 예외 처리: NaN인 경우 기본값 설정
        currentScaleX = isNaN(currentScaleX) ? 1 : currentScaleX;
        currentScaleY = isNaN(currentScaleY) ? 1 : currentScaleY;`;
};