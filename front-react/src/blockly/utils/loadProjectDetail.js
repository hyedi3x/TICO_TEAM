import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import toolboxXML from "../blocks/myBlocks";
import axios from "axios";
import ticoTheme from "../blocks/ticoTheme";
import axiosInstance from "../../pages/login/social/utils/axiosInstance";

// 상세 조회
export const fetchProjectDetail = async (project_id) => {
    try{
        const res = await axiosInstance.get(`/api/project/${project_id}`);
        return res.data;
    }
    catch (err){
        console.error('작품 목록 불러오기 실패:', err);
        throw err;
    }
};

// 👉 실제 로딩 함수 (프론트에서 호출)
export const loadProjectToCanvas = async (
  projectId,
  imgArr,
  blocklyArr,
  blocklyDiv,
  callImgArr,
  setWorkspaceReady,
) => {
  const detail = await fetchProjectDetail(projectId);
  const { objects } = detail;

  // 초기화
  imgArr.current = [];
  blocklyArr.current = [];
  blocklyDiv.current.innerHTML = '';

  // 1. 이미지 객체 먼저 모두 할당 (비동기 onload 기다리기)
  const imgPromises = objects.map((obj, i) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `http://localhost:8081${obj.url}`;

      img.onload = () => {
        imgArr.current[obj.objectIndex] = {
          img,
          url: obj.url,
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          angle: obj.angle,
          moveDirection: obj.moveDirection ?? 90,
          hidden: obj.hidden,
          hue: obj.hue,
          brightness: obj.brightness,
          opacity: obj.opacity,
          flipX: obj.flipX === -1 ? true : false,
          flipY: obj.flipY === -1 ? true : false,
          bubbleText: obj.bubbleText || '',
          index: obj.objectIndex,
        };
        resolve();
      };
    });
  });

  // 모든 이미지가 load 될 때까지 기다림 (여기까지 끝나면 imgArr.current가 완벽하게 채워짐)
  await Promise.all(imgPromises);

  // 2. 이제 모든 blocklyDiv, workspace, XML 세팅
  for (const obj of objects) {
    const div = document.createElement('div');
    div.id = `blockly${obj.objectIndex}`;
    div.style.height = '700px';
    div.style.width = '800px';
    blocklyDiv.current.appendChild(div);

    const workspace = Blockly.inject(div, {
      toolbox: toolboxXML(),
      theme: ticoTheme,
      move: {
        scrollbars: { horizontal: false, vertical: false },
        drag: false,
        wheel: false,
      },
      zoom: {
        controls: true,
        wheel: false,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true,
      },
    });
    blocklyArr.current.push(workspace); // 작업공간 담기
    workspace.index = obj.objectIndex;

    // 이 시점에 imgArr.current가 완전히 세팅되어 있으므로 dropdown 옵션 정상
    const xmlDom = Blockly.utils.xml.textToDom(obj.blockXml);
    Blockly.Xml.domToWorkspace(xmlDom, workspace);

    workspace.addChangeListener(() => {
      const updatedCode = javascriptGenerator.workspaceToCode(workspace);
      imgArr.current[workspace.index].code = updatedCode;
    });

    blocklyArr.current.forEach((_, index) => {
      const div = document.getElementById(`blockly${index}`);
      div.style.display = index === obj.objectIndex ? 'block' : 'none';
    });

    callImgArr();
  }
  setWorkspaceReady(true);

  return detail.project;
};