import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from "blockly"; // npm install Blockly 
import * as ko from 'blockly/msg/ko';  // 한글 번역 모듈
import { javascriptGenerator } from "blockly/javascript"; // JavaScript 코드 생성기 가져오기
import toolboxXML from '../blocks/myBlocks';
import RegisterBlockGenerator from '../blocks/blockGenerator';
import defineMyBlocks from '../blocks/myBlockJSON';
import runGeneratedCode from '../blocks/codeRunner';
import { drawSpeechBubble } from '../functions/appearances/bubbleUtils';
import { handleSaveProject } from "../utils/saveProjects";
import { handleLoadClick } from '../utils/loadProjects';
import { loadProjectToCanvas } from '../utils/loadProjectDetail';
import ProjectModal from './ProjectModal';
import "../components/BlocklyComponent.css";
import { generateStart, generateStartKey } from '../blocks/generateAndStoreCode';

Blockly.setLocale(ko); 

function Canvas() {
  // 캔버스  
  const canvasRef = useRef(null); // 캔버스
  
  // 이미지
  const imgArr = useRef([]); // 이미지 객체 배열을 useRef로 관리
  const selectedImageIndex = useRef(null); // 선택된 이미지 인덱스
  const INITIAL_POSITION = { x: 0, y: 0 }; // 초기 위치
  const panningRef = useRef(false); // 이동(패닝) 상태
  const viewPosRef = useRef(INITIAL_POSITION); // 캔버스 뷰포트 위치
  const startPosRef = useRef(INITIAL_POSITION); // 마우스 드래그 시작위치 저장

  //startPosRef.current는 마우스 다운 시 초기 위치를 저장하고, viewPosRef.current는 마우스 이동에 따른 현재 위치를 저장
  
  // 블록클리
  const blocklyArr = useRef([]);// 블록클리 객체를 배열로 관리
  const blocklyDiv = useRef(null);
  const workspaces = useRef([]); // 작업 공간 배열 관리
  const [workspaceReady, setWorkspaceReady] = useState(false); // 작업 공간 준비 상태

  // 마우스 좌표
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 }); // 마우스 이동위치
  const [imagePosition, setImagePosition] = useState([]); // 이미지 위치 상태 배열

  // 작품 목록(모달)
  const [projectList, setProjectList] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // 캔버스 생성
  const draw = () => {
    const canvas = canvasRef.current;
    canvas.width = canvas.width;// 캔버스의 너비를 다시 할당, 캔버스 내부 내용 지워짐
  };

  // 마운트 캔버스 생성
  useEffect(() => {
    defineMyBlocks(); // 블록 내부 정의

    callimage('https://i.namu.wiki/i/CmGNSPeYt7cloH3uYZ_XTlfknRtDrjYtFVCF5zuvzWLAeaTGqnsW9kDC6iLHjGoF9OamAkLNkxGxpxFHhYd_pQ.svg');

  }, []);
  
  // 이미지 호출 (클릭)
  const callimage= (imgUrl)=>{  
    const img = new Image();
    // onload와 분리해서 처리할 것(src로 로드 된 후 onload가 실행되기 때문)
    img.src = imgUrl;
      
    // 객체 로드시 배열에 js객체로 변수와 속성값을 추가
    img.onload = () =>{
      imgArr.current.push({
        img,
        url: imgUrl,
        x: canvasRef.current.width/2 - 50/2, // 이미지 위치 조정
        y: canvasRef.current.height/2 - 100/2,
        width: 50,
        height: 100,
        angle: 0, 
        index: imgArr.current.length, // index 할당
      })
      
      callImgArr(); // 이미지 추가 후 전체 다시 그리기
      
      // Blockly 작업공간 생성
      const blocklyDivElement = document.createElement('div');
      blocklyDivElement.id = `blockly${imgArr.current.length-1}`;
      blocklyDivElement.style.height = '700px';
      blocklyDivElement.style.width = '800px';
      blocklyDiv.current.appendChild(blocklyDivElement); // 부모요소.appendChild(추가할 자식요소) : HTML div 하위에 해당 작업공간 추가

      // 작업공간 주입
      const workspace = Blockly.inject(blocklyDivElement,{
        toolbox: toolboxXML(), // 도구 상자에 표시될 블록들을 정의하는 XML 문자열을 반환
        
        // 이동 설정
        move:
        {
          scrollbars: 
          {
            horizontal: false,
            vertical: false
          },
          drag: false,
          wheel: false
        },
      
        // 확대/축소 설정
        zoom: {
            controls: true,
            wheel: false,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
            pinch: true
        },
      });
      blocklyArr.current.push(workspace); // 작업공간 담기, 작업 공간을 제어가능
      workspace.index = imgArr.current.length - 1;
      setWorkspaceReady(true); // 작업 공간 준비 완료 상태 업데이트
      
      // 블록 생성 코드 등록 및 저장
      workspace.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace); //코드 변환
        imgArr.current[workspace.index].code = code; // 코드 저장
      });

      // 최신 추가 작업공간만 표시
      blocklyArr.current.forEach((item, index)=>{
        const blocklyDivElement = document.getElementById(`blockly${index}`);
        blocklyDivElement.style.display = (index === (blocklyArr.current.length-1) ? 'block' : 'none');
      });
      
    };
  };

  // 배열에 저장된 이미지 그리기
  const callImgArr = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    draw(); // 캔버스 초기화
    
    const updatedPositions = []; // 좌표 모아서 한 번에 setState

    imgArr.current.forEach((item,index) => {
      // 숨김 처리
      if (item.hidden) return;
  
      context.save();
  
      // 이미지 중심 이동
      context.translate(item.x + item.width / 2, item.y + item.height / 2);
  
      // 회전 적용
      context.rotate((item.angle * Math.PI) / 180);
  
      // 반전 처리
      const scaleX = item.flipX ? -1 : 1;
      const scaleY = item.flipY ? -1 : 1;
      context.scale(scaleX, scaleY);
  
      // 필터 처리 (색상/밝기/투명도)
      const hue = item.hue ?? 0;
      const brightness = item.brightness ?? 100;
      const opacity = item.opacity ?? 1;
      context.globalAlpha = opacity; // 투명도
      context.filter = `hue-rotate(${hue}deg) brightness(${brightness}%)`;
  
      // 이미지 그리기
      context.drawImage(
        item.img,
        -item.width / 2,
        -item.height / 2,
        item.width,
        item.height
      );
  
      context.restore();

      // ✅ 말풍선 그리기
      if (item.bubbleText) {
        drawSpeechBubble(context, item);  // 👉 이 부분이 있어야 함
      }

      // 이미지 위치 저장
      updatedPositions.push({ x: item.x, y: item.y });
    });

    // 💡 여기서 한 번만 setState
    setImagePosition(updatedPositions);

  };
  
  const handleMouseDown = (e) => { // handleMouseDown: 마우스 다운 이벤트를 처리하고 패닝을 시작합니다.
    const { offsetX, offsetY } = e.nativeEvent; 
    // offsetX와 offsetY는 마우스 이벤트가 발생한 위치를 이벤트가 발생한 요소(캔버스)의 왼쪽 상단 모서리를 기준으로 나타내는 값 
    // event.clientX - rect.left와 동일, 이 값들은 SyntheticEvent 객체에서 직접적으로 제공되지 않기에 nativeEvent가 필요하다.
    e.preventDefault(); // 해당 이벤트의 기본 동작을 중단시키는 역할 (텍스트 선택, 이미지 드래그 등 방지), 캔버스 요소는 기본적으로 사용자가 마우스로 드래그할 때 텍스트 선택이나 이미지 드래그와 같은 기본 동작을 수행, 사용자 정의 기능과 충돌 방지
    startPosRef.current = { // current속성에 새로운 값을 할당
      x: offsetX - viewPosRef.current.x, // 마우스 클릭 위치를 뷰포트 기준으로 변환한 좌표
      y: offsetY - viewPosRef.current.y,
    };
    panningRef.current = true;

    // 이미지 인덱스
    let imgIndex = -1;
    // 이미지 클릭 여부 확인
    imgArr.current.forEach((refItem, index)=>{
      if(
        offsetX >= refItem.x &&
        offsetX <= refItem.x + refItem.width &&
        offsetY >= refItem.y &&
        offsetY <= refItem.y+refItem.height
      ){
        selectedImageIndex.current = index; // 선택된 인덱스를 참조 객체 할당
        startPosRef.current = { x: offsetX - refItem.x, y: offsetY - refItem.y }; // 이미지 내부 클릭 위치 저장      
        if( index > imgIndex){
          imgIndex = index;
        };
      };
    });
    
    console.log('선택된 오브젝트 : ',imgIndex);
    blocklyArr.current.forEach((item, index)=>{

      const blocklyDivElement = document.getElementById(`blockly${index}`);
      if(imgIndex === -1){
        return;
      };
      if(blocklyDivElement){
        blocklyDivElement.style.display='none';
        if(index === imgIndex){
          blocklyDivElement.style.display='block';
        };
      };
    });
  };
  
  const handleMouseUp = (e) => { // handleMouseUp: 마우스 업 이벤트를 처리하고 패닝을 종료합니다.
    panningRef.current = false;
    selectedImageIndex.current = null; // 선택 해제
  };

  const handleMouseMove = (e) => { // handleMouseMove: 마우스 이동 이벤트를 처리하고 캔버스를 이동합니다. 
    const { offsetX, offsetY } = e.nativeEvent; // 마우스가 움직이는 동안의 좌표 받아옴
    e.preventDefault();
    setCoordinates({ x:  offsetX, y:  offsetY, });
    
    if (selectedImageIndex.current !== null) { // 선택 상태이면
      // 선택된 인덱스의 좌표를 업데이트
      imgArr.current[selectedImageIndex.current].x = offsetX - startPosRef.current.x;
      imgArr.current[selectedImageIndex.current].y = offsetY - startPosRef.current.y;
      callImgArr();// 이미지 이동후 다시 그리기
      
    }
  };
  
  // 이미지 파일 선택
  const selectimg = (event) =>{
    const file = event.target.files[0]; //multi 타입이 아니면 항상 1개
    if(file){
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgUrl = e.target.result;
        callimage(imgUrl); //url 전달
      };
      reader.readAsDataURL(file);
    }
  }

  // // 코드 순차 실행하기
  // const runCode = () => {
  //   imgArr.current.forEach((item, index) =>{
  //     if(item.code){
  //       runGeneratedCode(item.code, index);
  //     }
  //   })
  // };
  // 1. 실행하기 버튼 핸들러
const runStartBtnCode = () => {
  blocklyArr.current.forEach((workspace, index) => {
    generateStart(workspace, imgArr, index, 'start_btn');
    const code = imgArr.current[index]?.code;
    if (code) {
      runGeneratedCode(code, index);
    }
  });
};

// 2. 키보드 q 키 핸들러
useEffect(() => {
  const handleKeyPress = (e) => {
    
    const pressedKey = e.key;
    // 기본 동작 막아야 할 키 목록
    const keysToPrevent = [
      'ArrowUp', // 방향키
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      ' ', // 스페이스바
      'Enter',
      'Control',
      'Shift'
    ];
    if (keysToPrevent.includes(pressedKey)) { // 배열 중 키가 포함된다면
      e.preventDefault();
    }

    blocklyArr.current.forEach((workspace, index) => {
      // 워크스페이스에 있는 모든 블록을 가져옴
      const blocks = workspace.getAllBlocks();

      blocks.forEach((block) => {
        if (block.type === 'start_with_q') {
          const selectedKey = block.getFieldValue('KEY_OPTION'); // 사용자가 선택한 키
          if (pressedKey === selectedKey) {
            // 코드 생성 및 실행
            generateStartKey(block, imgArr, index);
            const code = imgArr.current[index]?.code;
            if (code) {
              runGeneratedCode(code, index);
            }
          }
        }
      });
    });
  };

  window.addEventListener('keydown', handleKeyPress); 
  return () => { // useEffect 훅에서 반환되는 함수는 컴포넌트가 언마운트될 때 실행
    window.removeEventListener('keydown', handleKeyPress);
  };
}, []);
  
  return (
    <div className="blockly-container">

      {/* 자식컴포넌트(blockGenerators) && 연산자로 workspace가 생성되고 랜더링하게 설정*/}
      {workspaceReady && <RegisterBlockGenerator imgArr={imgArr} callImgArr={callImgArr} />}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        >
        <canvas // 스타일과 마우스 핸들러 연결
          ref={canvasRef}
          width="500"
          height="500"
          style={{ border: '1px solid' }}
        />
          <div>
          <p> 마우스좌표  ( x좌표 : {coordinates.x} &nbsp; y좌표 : {coordinates.y})</p>
          {imagePosition.map((pos, index)=>(
            pos? (
              <p>이미지 {index + 1} 좌표 : x좌표 : {pos.x} &nbsp; y좌표 : {pos.y} </p>
            ): null
          ))}
            
          </div>
        </div>
        <div className="blockly-workspace">
          <div ref={blocklyDiv}>
              {/* 클릭할 때 마다 컨테이너에 담기는 작업공간이 변경된다. */}
          </div>
          <div className='buttons'>
            <input type="file" id="imgInput" accept="image/*" style={{display:'none'}} 
                onChange={selectimg}/>
            <button className='add-button' onClick={()=> document.querySelector('#imgInput').click()}>요소 추가</button>
            <button className='run-button' onClick={runStartBtnCode}>실행하기</button>
            <button className='save-button' onClick={() => handleSaveProject(imgArr, blocklyArr)}>저장하기</button>
            <button className='load-button'  onClick={() => handleLoadClick(setProjectList, setShowProjectModal)}>불러오기</button>
            <ProjectModal
              show={showProjectModal}
              onClose={() => setShowProjectModal(false)}
              projectList={projectList}
              onSelect={async (project) => {
                try {
                  await loadProjectToCanvas(
                    project.project_id,
                    imgArr,
                    blocklyArr,
                    blocklyDiv,
                    callImgArr,
                    setWorkspaceReady
                  );
                  setShowProjectModal(false); // 닫기
                } catch (err) {
                  alert('불러오기 실패!');
                }
              }}
            />
          </div>
      </div>
    </div>
      );
}
export default Canvas;