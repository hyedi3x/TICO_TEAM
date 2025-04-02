import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import toolboxXML from "../blocks/myBlocks";
import axios from "axios";

// 상세 조회
export const fetchProjectDetail = async (project_id) => {
    try{
        const res = await axios.get(`http://localhost:8081/project/${project_id}`);
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

  for (const obj of objects) {
    const img = new Image();
    img.src = obj.url;

    await new Promise((resolve) => {
      img.onload = () => {

        // 이미지 배열 정확한 위치에 할당
        const imgObject = {
          img,
          url: obj.url,
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          angle: obj.angle,
          hidden: obj.hidden,
          hue: obj.hue,
          brightness: obj.brightness,
          opacity: obj.opacity,
          flipX: obj.flip_x === -1 ? true : false,
          flipY: obj.flip_y === -1 ? true : false,
          bubbleText: obj.bubble_text || '',
          index: obj.object_index,
        };

        imgArr.current[obj.object_index] = imgObject;

        // 블록 작업공간 div 생성
        const div = document.createElement('div');
        div.id = `blockly${obj.object_index}`;
        div.style.height = '700px';
        div.style.width = '800px';
        blocklyDiv.current.appendChild(div);

        // workspace 생성
        const workspace = Blockly.inject(div, {
          toolbox: toolboxXML(),
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
        blocklyArr.current.push(workspace); // 작업공간 담기, 작업 공간을 제어가능
        workspace.index = obj.object_index;

        // XML 블록 로드
        const xmlDom = Blockly.utils.xml.textToDom(obj.block_xml);
        Blockly.Xml.domToWorkspace(xmlDom, workspace);

        workspace.addChangeListener(() => {
          const updatedCode = javascriptGenerator.workspaceToCode(workspace);
          imgArr.current[workspace.index].code = updatedCode;
        });

        // 선택된 인덱스만 표시
        blocklyArr.current.forEach((_, index) => {
          const div = document.getElementById(`blockly${index}`);
          div.style.display = index === obj.object_index ? 'block' : 'none';
        });

        callImgArr();
        resolve();
      };
    });
  }
  setWorkspaceReady(true);
};
