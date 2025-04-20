const runGeneratedCode = (code, index, isClone = false)=>{
    try {
        // 비동기 함수 생성
        const asyncFunc = new Function(
          'index',
          'isClone',
          `
          return (async () => {
            if (!window.running) return; // 🔴 실행 시작 전 체크
    
            try {
              ${code}
            } catch (e) {
              console.error("코드 실행 중 예외 발생:", e);
            }
    
          })();
        `
        );
        // async을 사용한 이유는 js는 기본적으로 비동기로 함수를 실행하기에 await (promise)로 내부에서 기다림 처리를 해주기 위해
        asyncFunc(index, isClone); // 즉시 실행
      } catch (err) {
        console.error('실행 오류:', err);
      }
}

export default runGeneratedCode;