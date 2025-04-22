import { imgArr, callImgArr, blocklyArr } from "../../blocks/blockGenerator";
import { javascriptGenerator } from "blockly/javascript";
import runGeneratedCode from "../../blocks/codeRunner";

const createClone = function(target, currentIndex) {
    if (!window.running) return;
    window.cloneArr = window.cloneArr || [];

    // 1. index 결정
    const index = (target === 'self') ? currentIndex : parseInt(target);
    const original = imgArr.current[index];
    if (!original) return;

    const clone = {
        ...JSON.parse(JSON.stringify(original)), 
        // 이미지 배열을 문자열로 변환 후 다시 객체로 생성 ( 깊은 복사 )
        img: original.img,
        index: window.cloneArr.length, // 덮어 쓰기
        isClone: true, // 복제본 여부
    };

    clone.x += 20;
    clone.y += 20;

    window.cloneArr.push(clone); // 여기로
    callImgArr();

    console.log("✅ 복제본 생성됨:", clone);

    // ✅ 복제된 오브젝트 생성 시 트리거 블록 실행
    const workspace = blocklyArr.current[index];
    const topBlocks = workspace.getTopBlocks();

    let code = '';

    for (let block of topBlocks) {
    if (block.type === 'on_clone_created') {
        code += javascriptGenerator.blockToCode(block);
    }
    }

    console.log("🧠 최종 실행 코드:", code);
    runGeneratedCode(code, clone.index, true);
};

const deleteThisClone = function(index) {
    if (!window.running) return;
    if (!window.cloneArr || !window.cloneArr[index]) return;
    
    // 배열에서 복제본 완전 삭제
    window.cloneArr.splice(index, 1);
    // index 재정렬: 모든 복제본의 index를 다시 부여
    window.cloneArr.forEach((clone, i) => {
      clone.index = i;
    });
    callImgArr();
  };
  
export default {
    createClone,
    deleteThisClone,
};
    
window.createClone = createClone;
window.deleteThisClone = deleteThisClone;