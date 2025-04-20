// Canvas에 말풍선을 그려주는 함수
export function drawSpeechBubble(ctx, item) {
    const text = item.bubbleText;
    if (!text) return; // 말풍선에 표시할 텍스트가 없으면 그리지 않음
  
    const padding = 10;
    const fontSize = 14;
    ctx.font = `${fontSize}px Arial`; // 텍스트 스타일 지정
  
    const textWidth = ctx.measureText(text).width; // 텍스트의 실제 픽셀 너비 측정, measyreText()는 폰트 스타일에 따라 측정
    const bubbleWidth = textWidth + padding * 2;   // 패딩을 포함한 말풍선 너비
    const bubbleHeight = fontSize + padding * 2;   // 텍스트 높이 + 패딩으로 말풍선 높이 계산
  
    const bubbleX = item.x + item.width / 2 - bubbleWidth / 2; // 이미지 위 중앙을 기준으로 정렬된 x 좌표
    const bubbleY = item.y - bubbleHeight - 10;                // 이미지 위로 10px 띄운 y 좌표
  
    // 🔵 말풍선 배경 그리기 (둥근 사각형)
    ctx.fillStyle = "#7f8e90";     // 배경색, fill을 사용하면 이 색으로 채움
    ctx.strokeStyle = "#444";      // 테두리색
    ctx.lineWidth = 1;             // stroke() 호출 시, 테두리 두께  
    ctx.beginPath();               // 경로 초기화, 이전 그림 경로 단절 (없으면 이전 그림과 이어짐)
    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10); // 둥근 사각형 그리기
    ctx.fill();    // 채우기
    ctx.stroke();  // 테두리 그리기
  
    // 🔺 말풍선 꼬리 그리기
    ctx.beginPath();
    ctx.moveTo(item.x + item.width / 2 - 5, bubbleY + bubbleHeight);      // moveTO() =  펜 이동 (왼쪽 꼭짓점)
    ctx.lineTo(item.x + item.width / 2 + 5, bubbleY + bubbleHeight);      // lineTo() =  현재위치에서 (x,y)까지 그리기, 오른쪽 꼭짓점
    ctx.lineTo(item.x + item.width / 2, bubbleY + bubbleHeight + 10);    // 아래쪽 꼭짓점 (꼬리 끝)
    ctx.closePath(); // 삼각형 닫기, 시작지점으로 닫기
    ctx.fill();      // 꼬리 채우기
  
    // 📝 텍스트 출력
    ctx.fillStyle = "#fff"; // 텍스트 색상
    ctx.fillText(text, bubbleX + padding, bubbleY + bubbleHeight / 2 + fontSize / 3); 
    // fillText(text, x, y) 문자열을 좌표에 그림, 폰트와 크기는 ctx.font에서 설정
    // padding만큼 오른쪽으로 띄우고, 수직 중앙 정렬
  };
  
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);                      // 왼쪽 위 시작점
    ctx.lineTo(x + width - radius, y);              // 오른쪽 위 직선
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius); // 오른쪽 위 모서리 둥글림
    ctx.lineTo(x + width, y + height - radius);     // 오른쪽 아래 직선
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // 아래 모서리 둥글림
    ctx.lineTo(x + radius, y + height);             // 아래 왼쪽 직선
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius); // 왼쪽 아래 둥글림
    ctx.lineTo(x, y + radius);                      // 왼쪽 위 직선
    ctx.quadraticCurveTo(x, y, x + radius, y);      // 왼쪽 위 둥글림
    ctx.closePath();                                // 경로 닫기
  }