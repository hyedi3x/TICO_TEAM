import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import * as Blockly from 'blockly';

export const handleSaveProject = async (imgArr, blocklyArr, project_id, projectTitle) => {
  const userid = localStorage.getItem("user_uuid"); // 추가

  const projectInfo = {
    projectId: project_id,
    userUuid: userid, // ✅ 추가된 필드
    title: projectTitle,
    thumbnailUrl: imgArr.current[0].url || '',
  };

  const cleanXml = (xmlText) => {
    return xmlText
      .replace(/ id="[^"]*"/g, '')       // 모든 id 제거
      .replace(/ xmlns="[^"]*"/g, '')    // xmlns 제거
      .replace(/\s{2,}/g, ' ')           // 과도한 공백 제거 (선택사항)
      .trim();
  };

  const objects = imgArr.current.map((item, index) => {
    const workspace = blocklyArr.current[index];
    const rawXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    const xml = cleanXml(rawXml);

    console.log("👉 저장되는 moveDirection 값:", item.moveDirection);

    return {
      objectIndex: index,
      url: item.url,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      angle: item.angle,
      moveDirection: item.moveDirection ?? 90,
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
      res = await axiosInstance.post('/project/saveProject', {
        projectInfo,
        objects
      });
      alert(`저장 완료! ${res.data}번째 작품이 저장되었습니다.`);
    } 
    else {
      // UPDATE (기존 작품 수정)
      res = await axiosInstance.put('/project/updateProject', {
        projectInfo,
        objects
      });
      alert(`수정 완료! ${res.data}번째 작품이 수정되었습니다.`);
    }
  } catch (err) {
    console.error("저장 실패:", err);
    alert("저장에 실패했습니다.");
  }
};
