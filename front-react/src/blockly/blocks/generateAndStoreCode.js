import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export const generateStart = (workspace, imgArr, index, blockType) => {
  const topBlocks = workspace.getTopBlocks();
  const allBlocksCode = [];

  topBlocks.forEach((topBlock) => {
    if (topBlock.type === blockType) {
      let currentBlock = topBlock;
      const code = javascriptGenerator.blockToCode(currentBlock); // 연결된 블럭들도 가져온다.
      allBlocksCode.push(code);
    }
  });

  // 하나의 문자열 코드로 연결
  imgArr.current[index].code = allBlocksCode.join(' '); // 줄바꿈 이미 있음
};

export const generateStartKey = (startBlock, imgArr, index) => {
  const allBlocksCode = [];
  const code = javascriptGenerator.blockToCode(startBlock);
  allBlocksCode.push(code);

  imgArr.current[index].code = allBlocksCode.join(' ');
};