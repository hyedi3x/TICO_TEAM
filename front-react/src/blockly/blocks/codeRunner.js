

const runGeneratedCode = (code, index)=>{
    try {
        // 비동기 함수 생성
        const asyncFunc = new Function(
          'index',
          `
          return (async () => {
            ${code}
          })();
        `
        );
    
        asyncFunc(index); // 즉시 실행
      } catch (err) {
        console.error('실행 오류:', err);
      }
}

export default runGeneratedCode;