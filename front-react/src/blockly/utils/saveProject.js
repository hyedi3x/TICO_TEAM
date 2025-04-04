import axios from 'axios';
import * as Blockly from 'blockly';

export const handleSaveProject = async (imgArr, blocklyArr, project_id) => {
  const projectInfo = {
    projectId: project_id,
    title: "내 작품",
    category: "기타",
    thumbnailUrl: imgArr.current[0].url || '',
    introduction: "이건 소개입니다",
    guide: "사용법을 입력하세요",
  };

  const objects = imgArr.current.map((item, index) => {
    const workspace = blocklyArr.current[index];
    const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));

    return {
      objectIndex: index,
      url: item.url,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      angle: item.angle,
      hidden: item.hidden,
      hue: item.hue ?? 0,
      brightness: item.brightness ?? 100,
      opacity: item.opacity ?? 1,
      flipX: item.flipX ? -1 : 1,
      flipY: item.flipY ? -1 : 1,
      bubbleText: item.bubbleText ?? '',
      blockXml: xml
    };
  });
  
  try {
    let res;
    if (!project_id) {
      // INSERT (신규 저장)
      res = await axios.post('http://localhost:8081/project/saveProject', {
        projectInfo,
        objects
      });
      alert(`저장 완료! 새 projectId : ${res.data}`);
    } 
    else {
      // UPDATE (기존 작품 수정)
      res = await axios.put('http://localhost:8081/project/updateProject', {
        projectInfo,
        objects
      });
      alert(`업데이트 완료! projectId : ${project_id}`);
    }
  } catch (err) {
    console.error("저장 실패:", err);
    alert("저장에 실패했습니다.");
  }
};
