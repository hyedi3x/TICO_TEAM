import axios from 'axios';
import * as Blockly from 'blockly';

export const handleSaveProject = async (imgArr, blocklyArr) => {
  const projectInfo = {
    title: "내 작품",
    category: "기타",
    thumbnail_url: imgArr.current[0].url || '',
    introduction: "이건 소개입니다",
    guide: "사용법을 입력하세요",
  };

  const objects = imgArr.current.map((item, index) => {
    const workspace = blocklyArr.current[index];
    const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));

    return {
      object_index: index,
      url: item.url,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      angle: item.angle,
      hue: item.hue ?? 0,
      brightness: item.brightness ?? 100,
      opacity: item.opacity ?? 1,
      flip_x: item.flipX ? -1 : 1,
      flip_y: item.flipY ? -1 : 1,
      bubble_text: item.bubbleText ?? '',
      block_xml: xml
    };
  });
  
  try {
    const res = await axios.post('http://localhost:8081/project/saveProject', {
      projectInfo,
      objects
    });
    alert(`저장 완료! projectId : ${res.data}`);
  } catch (err) {
    console.error("저장 실패:", err);
    alert("저장에 실패했습니다.");
  }
};
