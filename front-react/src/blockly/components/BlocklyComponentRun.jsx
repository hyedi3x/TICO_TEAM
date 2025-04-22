import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Blockly from "blockly"; // npm install Blockly 
import * as ko from 'blockly/msg/ko';  // 한글 번역 모듈
import { javascriptGenerator } from "blockly/javascript"; // JavaScript 코드 생성기 가져오기
import toolboxXML from '../blocks/myBlocks';
import RegisterBlockGenerator from '../blocks/blockGenerator';
import defineMyBlocks from '../blocks/myBlockJSON';
import runGeneratedCode from '../blocks/codeRunner';
import { generateStart, generateStartKey } from '../blocks/generateAndStoreCode';
import { drawSpeechBubble } from '../functions/appearances/bubbleUtils';
import { loadProjectToCanvas } from '../utils/loadProjectDetail';
import "../components/BlocklyComponent.css";
import ticoTheme from '../blocks/ticoTheme';
import { registerWhackableClickListener } from '../games/whackMoleGame';
import { drawScoreText } from '../functions/cals/calFunctions';
import axios from 'axios';

Blockly.setLocale(ko); // Blockly 언어를 한국어로 설정

function ShareCanvas() {
  /** ─────────────── Refs & States ─────────────── **/
  const canvasRef = useRef(null); // 캔버스 DOM 참조
  const imgArr = useRef([]); // 이미지 객체 리스트
  const blocklyArr = useRef([]);// 블록클리 객체를 배열로 관리
  const blocklyDiv = useRef(null);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  
  // 마우스 이동 관련 상태 및 참조값
  const INITIAL_POSITION = { x: 0, y: 0 }; // 초기 위치
  const viewPosRef = useRef(INITIAL_POSITION); // 캔버스 뷰포트 위치
  const startPosRef = useRef(INITIAL_POSITION); // 마우스 드래그 시작위치 저장
  const panningRef = useRef(false); // 이동(패닝) 상태
  
  // 마우스 좌표
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 }); // 마우스 이동위치
  
  const [workspaceReady, setWorkspaceReady] = useState(false); // 작업 공간 준비 상태
  const [imagePosition, setImagePosition] = useState([]); // 이미지 위치 상태 배열

  // 모달 상태 및 프로젝트 목록
  const currentProjectId = useRef(null); // 현재 작업 중인 project_id

  const navigate = useNavigate(); // 페이지 이동 함수

  const handleButtonClick = () => {
    // ObjectSelectPage 경로로 이동
    navigate('/select-object');
  };


  // 키보드 상태 트래킹
  const [keysPressed, setKeysPressed] = useState({}); // 눌린 키 상태를 저장하는 객체
   /** ─────────────── 캔버스 그리기 ─────────────── **/
  const draw = () => {
    const canvas = canvasRef.current;
    // eslint-disable-next-line
    canvas.width = canvas.width;// 캔버스의 너비를 다시 할당, 캔버스 내부 내용 지워짐
  };



  const { projectId } = useParams();

  /** ─────────────── 초기 로딩 ─────────────── **/
  useEffect(() => {
    let isMounted = true; // 컴포넌트가 마운트된 상태인지 체크
  
    if (projectId) {
      (async () => {
        try {
          window.cloneArr = [];
          await loadProjectToCanvas(
            Number(projectId),
            imgArr,
            blocklyArr,
            blocklyDiv,
            callImgArr,
            setWorkspaceReady
          );
          if (isMounted) { // 컴포넌트가 마운트 상태일 때만 상태 업데이트
            currentProjectId.current = Number(projectId);
          }
        } catch (err) {
          if (isMounted) {
            alert('초기 불러오기 실패!');
          }
        }
      })();
    }
  
    return () => {
      isMounted = false; // 컴포넌트가 언마운트될 때 상태 변경 방지
    };
  }, [projectId]);
  

  useEffect(() => {
    defineMyBlocks(); // 사용자 정의 블록 등록
    callimage('http://localhost:8081/uploads/loading.png');
    // eslint-disable-next-line
  }, []);
  
  /** ─────────────── 이미지 및 Blockly 생성 ─────────────── **/
  const callimage= (imgUrl)=>{  
    const img = new Image();
    // onload와 분리해서 처리할 것(src로 로드 된 후 onload가 실행되기 때문)
    if(imgUrl === 'http://localhost:8081/uploads/loading.png'){
      img.src = imgUrl;
    } else {
      img.src = `http://localhost:8081${imgUrl}`;

  }
      
    // 객체 로드시 배열에 js객체로 변수와 속성값을 추가
    img.onload = () =>{
      imgArr.current.push({
        img,
        url: imgUrl,
        x: canvasRef.current.width/2 - 300/2, // 이미지 위치 조정
        y: canvasRef.current.height/2 - 300/2,
        width: 300, //임시 로딩 사이즈
        height: 300, //임시 로딩 사이즈
        angle: 0, 
        moveDirection: 90,
        index: imgArr.current.length, // index 할당
        hidden: false,  // 이미지 숨김 여부
      })
      console.log("이미지 URL:", imgUrl);
      console.log("이미지 객체:", img);
      callImgArr(); // 이미지 추가 후 전체 다시 그리기
      
      // Blockly 작업공간 DOM 생성 및 주입
      const blocklyDivElement = document.createElement('div');
      blocklyDivElement.id = `blockly${imgArr.current.length-1}`;
      blocklyDivElement.style.height = '700px';
      blocklyDivElement.style.width = '800px';
      blocklyDiv.current.appendChild(blocklyDivElement); // 부모요소.appendChild(추가할 자식요소) : HTML div 하위에 해당 작업공간 추가

      // 작업공간 주입
      const workspace = Blockly.inject(blocklyDivElement, {
        toolbox: toolboxXML(),
        theme: ticoTheme,
        move: { scrollbars: { horizontal: false, vertical: false }, drag: false, wheel: false },
        zoom: { controls: true, wheel: false, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2, pinch: true }
      });

      blocklyArr.current.push(workspace); // 작업공간 담기, 작업 공간을 제어가능
      workspace.index = imgArr.current.length - 1;
      setWorkspaceReady(true); // 작업 공간 준비 완료 상태 업데이트
      
      // 블록 변경 이벤트 → 코드 저장
      workspace.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace); //코드 변환
        // ✅ 방어 코드 추가
        if (imgArr.current[workspace.index]) {
          imgArr.current[workspace.index].code = code;
        }
      });

      // 최신 추가 작업공간만 표시(마지막 workspace만)
      blocklyArr.current.forEach((item, index)=>{
        const blocklyDivElement = document.getElementById(`blockly${index}`);
        blocklyDivElement.style.display = (index === (blocklyArr.current.length-1) ? 'block' : 'none');
      });
    };
    img.onerror = (error) => {
      console.error('이미지 로드 실패:', error);
      alert('이미지 로드에 실패했습니다.');
    };
  };

  // 이미지와 말풍선을 모두 그리는 함수
  const callImgArr = () => {
   
    const canvas = canvasRef.current;
    if (!canvas) {
      return; // 캔바스 내부 애니메이션 잔재 방지
    }
    const context = canvas.getContext('2d');
    draw(); // 캔버스 초기화
    
    const updatedPositions = []; // 좌표 모아서 한 번에 setState

    const allObjects = [...imgArr.current, ...(window.cloneArr || [])]; // ✅ 복제본 포함

    allObjects.forEach((item, index) => {

      // 👉 먼저 updatedPositions에 push (hidden 정보 포함)
      updatedPositions.push({ x: item.x, y: item.y, hidden: item.hidden });

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

      // 필터 적용
      context.globalAlpha = item.opacity ?? 1;
      context.filter = `hue-rotate(${item.hue ?? 0}deg) brightness(${item.brightness ?? 100}%)`;
  
      // 이미지 그리기
      context.drawImage(
        item.img,
        -item.width / 2,
        -item.height / 2,
        item.width,
        item.height
      );
  
      context.restore();

      // ✅ 말풍선 텍스트가 있는 경우 표시
      if (item.bubbleText) {
        drawSpeechBubble(context, item);  // 👉 이 부분이 있어야 함
      }
    });

    // 💡 여기서 한 번만 setState
    setImagePosition(updatedPositions);

    if (window.elapsedTime > 0) {
      window.drawTimerText(); // 항상 타이머 위에 그리기
    }

    if (window.showScore) {
      drawScoreText();
    }
  };
  
  /** ─────────────── 마우스 이벤트 ─────────────── **/

  // handleMouseDown: 마우스 다운 이벤트를 처리하고 패닝을 시작
  const handleMouseDown = (e) => { 
    const { offsetX, offsetY } = e.nativeEvent; 
    // offsetX와 offsetY는 마우스 이벤트가 발생한 위치를 이벤트가 발생한 요소(캔버스)의 왼쪽 상단 모서리를 기준으로 나타내는 값 
    // event.clientX - rect.left와 동일, 이 값들은 SyntheticEvent 객체에서 직접적으로 제공되지 않기에 nativeEvent가 필요하다.
    e.preventDefault(); // 해당 이벤트의 기본 동작을 중단시키는 역할 (텍스트 선택, 이미지 드래그 등 방지), 캔버스 요소는 기본적으로 사용자가 마우스로 드래그할 때 텍스트 선택이나 이미지 드래그와 같은 기본 동작을 수행, 사용자 정의 기능과 충돌 방지
  
    // 이미지 선택 여부 확인
    let imgIndex = -1;
    
    // 이미지 클릭 여부 확인
    imgArr.current.forEach((refItem, index) => {
      if (
        offsetX >= refItem.x &&
        offsetX <= refItem.x + refItem.width &&
        offsetY >= refItem.y &&
        offsetY <= refItem.y + refItem.height
      ) {
        // 🔒 배경은 선택되지 않도록 예외 처리
        if (!refItem.isBackground) {
          setSelectedImageIndex(index);
          startPosRef.current = { x: offsetX - refItem.x, y: offsetY - refItem.y };
          if (index > imgIndex) {
            imgIndex = index;
          }
        }
      };
    });
  
    if (imgIndex >= 0) {
      panningRef.current = true; // ✅ 이미지 내부 클릭 시에만 드래그 활성화
    } else {
      panningRef.current = false; // ✅ 이미지 외부 클릭 시 드래그 비활성화
    }
  
    console.log('선택된 오브젝트 : ', imgIndex);
    blocklyArr.current.forEach((item, index) => {
      const blocklyDivElement = document.getElementById(`blockly${index}`);
      if (imgIndex === -1) {
        return;
      };
      if (blocklyDivElement) {
        blocklyDivElement.style.display = 'none';
        if (index === imgIndex) {
          blocklyDivElement.style.display = 'block';
        };
      };
    });
  };
  
  
  // handleMouseUp: 마우스 업 이벤트를 처리하고 패닝을 종료
  const handleMouseUp = () => { 
    panningRef.current = false;
    // setSelectedImageIndex(null); // 선택 해제
  };

  // handleMouseMove: 마우스 이동 이벤트를 처리하고 캔버스를 이동
  const handleMouseMove = (e) => { 
    const { offsetX, offsetY } = e.nativeEvent; // 마우스가 움직이는 동안의 좌표 받아옴
    e.preventDefault();
    setCoordinates({ x:  offsetX, y:  offsetY, });
    
    // 선택 상태이면
    if (selectedImageIndex !== null &&
      panningRef.current && // ✅ 마우스를 누르고 있을 때만
      e.target === canvasRef.current // ✅ 캔버스에서만
    ) { 
      
      // 선택된 인덱스의 좌표를 업데이트
      imgArr.current[selectedImageIndex].x = offsetX - startPosRef.current.x;
      imgArr.current[selectedImageIndex].y = offsetY - startPosRef.current.y;
      callImgArr(); // 이미지 이동후 다시 그리기
      
    }
  };
  
  // 이미지 파일 선택
  const selectimg = async (event) => {
    const file = event.target.files[0]; // 한 개만 선택
    if (!file) return;
  
    const formData = new FormData(); // 파일 전송용 객체 생성, JSON과 다른 파일 전송 가능, Content-Type 자동 설정
    formData.append('file', file);   // key: "file", value: 파일 객체
  
    try {
      const response = await axios.post('http://localhost:8081/project/uploadImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 전송 시 필요한 헤더
        },
      });
  
      const { imageUrl } = await response.json(); // 백엔드가 준 URL 추출
      console.log('콘솔',imageUrl);
      callimage(imageUrl); // 정적 URL로 이미지 호출 함수 실행
    } catch (err) {
      console.error('업로드 중 오류 발생:', err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
    // 파일 처리 후 input reset
    event.target.value = '';  // value를 비워서 리셋, 동일파일도 onChange가 적용되도록
  };

    // 1. 실행하기 버튼 핸들러
  const runStartBtnCode = () => {
    window.running = true; // 실행 상태 ON
    blocklyArr.current.forEach((workspace, index) => {
      generateStart(workspace, imgArr, index, 'start_btn');
      const code = imgArr.current[index]?.code;
      if (code) {
        runGeneratedCode(code, index, false);
      }
    });
  };

  // ✅ 멈춤 버튼 핸들러
  const runStopBtnCode = () => {
    window.running = false; // 실행 상태 OFF
    console.log("🔴 실행 중지됨!");
  };

  const handleKeyDown = (e) => {
    setKeysPressed((prev) => ({ ...prev, [e.key]: true }));
  };
  
  const handleKeyUp = (e) => {
    setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
  };

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const pressedKeys = {};
    let animationFrameId = null;
  
    const keysToPrevent = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      ' ', 'Enter', 'Control', 'Shift'
    ];
  
    const loop = () => {
      if (window.running) {
        window.running = true;
    
        blocklyArr.current.forEach((workspace, index) => {
          const blocks = workspace.getAllBlocks();
          blocks.forEach((block) => {
            if (block.type === 'start_with_q') {
              const selectedKey = block.getFieldValue('KEY_OPTION');
              if (pressedKeys[selectedKey]) {
                javascriptGenerator.init(workspace);
                generateStartKey(block, imgArr, index);
                const code = imgArr.current[index]?.code;
                if (code) runGeneratedCode(code, index, false);
              }
            }
          });
        });
      }  
      animationFrameId = requestAnimationFrame(loop); 
      // 브라우저가 다음 화면을 그리기 직전에 callback 함수를 실행, 16.66ms마다 한 번씩 실행
      // requestAnimationFrame()은 호출할 때 고유한 id를 반환함. 이 id를 나중에 취소용
    };
  
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

      pressedKeys[e.key] = true;
      if (keysToPrevent.includes(e.key)) e.preventDefault();
  
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };
  
    const handleKeyUp = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      pressedKeys[e.key] = false;
      if (keysToPrevent.includes(e.key)) e.preventDefault();
  
      // 모든 키가 떨어졌을 때만 루프 중지
      const anyKeyPressed = Object.values(pressedKeys).some((v) => v);
      if (!anyKeyPressed && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        // requestAnimationFrame()으로 예약된 다음 프레임 실행을 취소
        animationFrameId = null;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);


  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if(!canvas) return;

    const handleCanvasClick = () => {
      blocklyArr.current.forEach((workspace, index) => {
        const blocks = workspace.getTopBlocks();
        const hasMouseClickStart = blocks.some(block => block.type === 'start_mouse_clicked');
  
        if (hasMouseClickStart) {
          // 시작 블록 기준 코드 생성
          generateStart(workspace, imgArr, index, 'start_mouse_clicked');
  
          // 코드 실행
          const code = imgArr.current[index]?.code;
          if (code) {
            runGeneratedCode(code, index, false);
          }
        }
      });
    };
  
    canvas.addEventListener("click", handleCanvasClick);
    return () => canvas.removeEventListener("click", handleCanvasClick);
  }, []);
  
  // 이미지, 작업공간 삭제
  function imgDel(index) {
    console.log('삭제할 인덱스 : ', index);
  
    // 1. 이미지 배열에서 제거
    imgArr.current.splice(index, 1);
  
    // 2. Blockly 작업공간 제거
    const workspaceToRemove = blocklyArr.current[index];
    if (workspaceToRemove) {
      workspaceToRemove.dispose(); // 내부 블록, 이벤트 등 메모리 제거
    }
  
    // 3. DOM에서 블록리 작업공간 div 제거
    const blocklyDivElement = document.getElementById(`blockly${index}`);
    if (blocklyDivElement) {
      blocklyDivElement.remove(); // 실제 DOM 제거
    }
  
    // 4. 배열에서도 제거
    blocklyArr.current.splice(index, 1);
  
    // 5. 🔁 남은 작업공간들 인덱스 및 DOM ID 재정렬
    blocklyArr.current.forEach((workspace, newIndex) => { // 마우스 클릭시, 아이디 사용, 아래 보이는 작업공간 처리를 위해서도 id 재할당 필요
      const oldId = `blockly${workspace.index}`; // 작업공간별 저장했던 인덱스
      const newId = `blockly${newIndex}`;
      const div = document.getElementById(oldId); // 옛날 id 갱신
      if (div) {
        div.id = newId; // id 갱신
      }
    });
    const elements = document.querySelectorAll('[id*="blockly"][style="display: block;"]'); // *=은 부분일치
    if(elements.length === 0){
      const firstBlock = document.getElementById("blockly0");
      if (firstBlock) {
        firstBlock.style.display = "block";
      }
    }
    // 6. 전체 다시 렌더링
    callImgArr();
  }

  // 내부 useEffect
  useEffect(() => {
    const cleanup = registerWhackableClickListener({
      imgArr,
      canvasRef,
      callImgArr,
    });
    return () => cleanup();
  }, []);
  

  /** ─────────────── 렌더링 ─────────────── **/
  return (
    <div className="blockly-container">
      {workspaceReady && (
        <RegisterBlockGenerator
          imgArr={imgArr}
          callImgArr={callImgArr}
          blocklyArr={blocklyArr}
          coordinates={coordinates}
        />
      )}
      <div className="editor-wrapper">
        <div className="canvas-and-objects">
          <div className="canvas-area"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <canvas
              ref={canvasRef}
              width="500"
              height="500"
              style={{ border: '1px solid', backgroundColor: 'transparent' }}
            />
            <div className="button-blockly mt-3">
              <button onClick={runStartBtnCode} className="btn btn-success me-2">▶️ 실행하기</button>
              <button onClick={runStopBtnCode} className="btn btn-secondary">⏹️ 멈추기</button>
            </div>
          </div>
        </div>

        <div className="blockly-area" style={{ display: 'none' }}>
          <div ref={blocklyDiv}></div>
        </div>
      </div>
    </div>
  );
}
export default ShareCanvas;