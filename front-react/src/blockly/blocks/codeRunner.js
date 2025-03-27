import { javascriptGenerator } from "blockly/javascript"

//javascriptGenerator는 Blockly 블록을 JavaScript 코드로 변환하는 데 사용되는 객체

// 블록의 유형에 따라 JavaScript 코드를 생성하는 함수들을 포함

// const getGeneratedCode = (workspace) => {
//     if(workspace){
//         const code = javascriptGenerator.workspaceToCode(workspace);
//         // .workspaceToCode(workspace): javascriptGenerator 객체의 메서드 중 하나로, 주어진 작업 공간(workspace)에 있는 모든 블록들을 JavaScript 코드로 변환
    
//         // javascriptGenerator.forBlock은 단순히 JavaScript 코드 문자열을 생성하는 역할
//         // forBlock로 개별로 생성된 코드 조각을 worksapceToCode로  모든 블록들을 순회하면서 개별 블록의 생성된 코드를 합쳐서 최종 코드를 생성
//         // 문자열을 반환
//         console.log("🔹 변환된 코드:", code);
//         return code;
//     }
//     return ""; // 워크스페이스가 유효하지않으면 빈문자열 반환
// };

const runGeneratedCode = (code)=>{
    
    // 전체 코드 js문 변수에 담기
    //const code = getGeneratedCode(workspace);
    //if(code){ //code 변수가 null 또는 undefined가 아닌 경우
        try{
            new  Function(code)(); //Function 생성자를 사용하여 code 문자열을 JavaScript 함수로 변환하고 즉시 실행
            // 문자열 형태의 코드를 인자로 받아 함수를 생성, eval() 함수보다 보안상 안전
            // 생성된 함수 객체 뒤에 ()를 붙이면 함수를 즉시 호출
        } catch(e){
            console.error("🔴 실행 오류:",e);
        }
    //}
}

export default runGeneratedCode;