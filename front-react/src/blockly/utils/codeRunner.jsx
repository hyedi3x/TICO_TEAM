import { javascriptGenerator } from "blockly/javascript";

/*
    Blockly 워크스페이스에서 JavaScript 코드 생성
    만들어진 블록을 실제로 JavaScript 코드로 변환시키는 코드
*/
export const getGeneratedCode = (workspace) => {
    if (workspace) {
        const code = javascriptGenerator.workspaceToCode(workspace);
        console.log("🔹 변환된 코드:", code);
        return code;
    }
    return "";
};

// 생성된 JavaScript 코드 실행
export const runGeneratedCode = (workspace) => {
    const code = getGeneratedCode(workspace);
    if (code) {
        try {
            new Function(code)();
        } catch (e) {
            console.error("🔴 실행 오류:", e);
        }
    }
};
