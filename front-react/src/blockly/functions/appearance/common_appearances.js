export const extractFilterData = (sprite) => {
    return `
        // data-attribute에 필터 속성 값 저장
        if(!${sprite}.dataset.hue || !${sprite}.dataset.brightness){
            const style = window.getComputedStyle(${sprite}).filter;
            if(style === 'none') return;  // filter 스타일이 없으면 종료
            
            ${sprite}.dataset.hue = 0;
            ${sprite}.dataset.brightness = 100;
        }
        
        // 색상 가져오기
        let currentHue = parseFloat(${sprite}.dataset.hue);
        
        // 밝기 가져오기
        let currentBrightness = parseFloat(${sprite}.dataset.brightness);`;
};
    
/*
    말풍선(appearance.js)에 공통적으로 들어가는 코드
    sprite => 정보를 추출할 HTML 요소의 ID 또는 요소 자체
    text => 말풍선 안에 들어갈 말
    sprite의 위치를 기준으로 말풍선의 위치를 선정
    bubble => 말풍선
    after => bubble 안에 자식 태그로 삽입되는 말풍선 꼬리
    after는 bubble의 자식 태그로 bubble의 크기에 따라 위치가 자동으로 변경됨
*/
export const extractBubbleData = (sprite, text) => {
    return `
        // 부모 요소가 position: relative가 되어야 말풍선 위치 지정 가능
        const parent = ${sprite}.parentElement;
        if (!parent) return;

        // 부모 요소에 relative 스타일 적용 (이미 적용되어 있지 않은 경우에만)
        if (window.getComputedStyle(parent).position !== 'relative') {
            parent.style.position = 'relative';
        }

        // 기존 말풍선 제거 (중복 방지)
        const oldBubble = parent.querySelector('.speech-bubble');
        if (oldBubble) {
            oldBubble.remove();
        }

        // 말풍선 요소 생성
        const bubble = document.createElement('div');
        bubble.classList.add('speech-bubble');
        bubble.innerText = ${text};

        // 스타일 설정
        Object.assign(bubble.style, {
            position: 'absolute',
            padding: '1em',
            background: '#7f8e90',
            color: 'white',
            borderRadius: '0.6em',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            maxWidth: '200px',
            textAlign: 'center',
            zIndex: '80',
        });

        // 말풍선 꼬리 스타일 설정
        const after = document.createElement('div');
        Object.assign(after.style, {
            content: '""',
            position: 'absolute',
            bottom: '0',
            left: '50%',
            width: '0',
            height: '0',
            border: '15px solid transparent',
            borderTopColor: '#7f8e90',
            borderBottom: '0',
            borderLeft: '0',
            marginBottom: '-15px',
        });

        // 말풍선에 꼬리 추가
        bubble.appendChild(after);

        // 부모 요소에 추가
        parent.appendChild(bubble);

        // sprite 요소의 위치를 기준으로 말풍선 위치 설정
        const spriteRect = ${sprite}.getBoundingClientRect();
        bubble.style.left = \`\${spriteRect.left - parent.getBoundingClientRect().left + spriteRect.width / 2}px\`;
        bubble.style.top = \`\${spriteRect.top - parent.getBoundingClientRect().top - spriteRect.height / 2}px\`;`;
};