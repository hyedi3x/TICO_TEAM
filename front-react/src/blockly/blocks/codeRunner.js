const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const runGeneratedCode = async (code, index)=>{
    try{
        const asyncFn = new AsyncFunction('index', code);
        await asyncFn(index);
    } catch(e){
        console.error("🔴 실행 오류:",e);
    }
}

export default runGeneratedCode;