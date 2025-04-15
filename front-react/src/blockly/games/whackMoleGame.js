// games/whackMoleGame.js

// ✅ 최소한의 클릭 감지 로직만 제공 (공통 테마용)

export const registerWhackableClickListener = ({ imgArr, canvasRef, callImgArr, setScore }) => {
    const handleClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
  
      const allObjects = [...(window.cloneArr || [])];
  
      allObjects.forEach((obj, index) => {
        if (
          !obj.hidden &&
          offsetX >= obj.x &&
          offsetX <= obj.x + obj.width &&
          offsetY >= obj.y &&
          offsetY <= obj.y + obj.height
        ) {
          obj.hidden = true;
          callImgArr();
          setScore((prev) => prev + 1);
        }
      });
    };
  
    canvasRef.current?.addEventListener("click", handleClick);
  
    return () => {
      canvasRef.current?.removeEventListener("click", handleClick);
    };
  };