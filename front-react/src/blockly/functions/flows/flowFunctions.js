import { imgArr, callImgArr, blocklyArr } from "../../blocks/blockGenerator";
import { javascriptGenerator } from "blockly/javascript";
import runGeneratedCode from "../../blocks/codeRunner";

const createClone = function(target, currentIndex) {
    window.cloneArr = window.cloneArr || [];

    // 1. index 결정
    const index = (target === 'self') ? currentIndex : parseInt(target);
    const original = imgArr.current[index];
    if (!original) return;

    const clone = {
        ...JSON.parse(JSON.stringify(original)),
        img: original.img,
        index: window.cloneArr.length
    };

    clone.x += 20;
    clone.y += 20;

    window.cloneArr.push(clone); // ✅ 여기로
    callImgArr();

    console.log("✅ 복제본 생성됨:", clone);

    // ✅ 복제된 오브젝트 생성 시 트리거 블록 실행
    const workspace = blocklyArr.current[index];
    const topBlocks = workspace.getTopBlocks();

    for (let block of topBlocks) {
        if (block.type === 'on_clone_created') {
            const code = javascriptGenerator.blockToCode(block);
            runGeneratedCode(code, clone.index, true); // 복제된 index로 실행
            break;
        }
    }
};

const deleteThisClone = function(index) {
    if (!window.cloneArr || !window.cloneArr[index]) return;
  
    // 삭제: index 자리만 제거
    window.cloneArr.splice(index, 1);
  
    // callImgArr로 캔버스 다시 그리기
    callImgArr();
    
    console.log("❌ 복제본 삭제됨:", index);
};

export default {
    createClone,
    deleteThisClone
};

window.createClone = createClone;
window.deleteThisClone = deleteThisClone;