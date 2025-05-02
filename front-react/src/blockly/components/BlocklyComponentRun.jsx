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
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import ScoreModal from './ScoreModal';
;Blockly.setLocale(ko); // Blockly 언어를 한국어로 설정

function ShareCanvas() {
  /** ─────────────── Refs & States ─────────────── **/
  const canvasRef = useRef(null); // 캔버스 DOM 참조
  const imgArr = useRef([]); // 이미지 객체 리스트
  const blocklyArr = useRef([]);// 블록클리 객체를 배열로 관리
  const blocklyDiv = useRef(null);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  
  // 마우스 이동 관련 상태 및 참조값
  const INITIAL_POSITION = { x: 0, y: 0 }; // 초기 위치
  const startPosRef = useRef(INITIAL_POSITION); // 마우스 드래그 시작위치 저장
  const panningRef = useRef(false); // 이동(패닝) 상태
  
  // 마우스 좌표
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 }); // 마우스 이동위치
  const [workspaceReady, setWorkspaceReady] = useState(false); // 작업 공간 준비 상태
  const [imagePosition, setImagePosition] = useState([]); // 이미지 위치 상태 배열

  // 모달 상태 및 프로젝트 목록
  const currentProjectId = useRef(null); // 현재 작업 중인 project_id
  const navigate = useNavigate(); // 페이지 이동 함수

  // 시작 상태 백업
    const [backupState, setBackupState] = useState({
      imgArr: [],         // 이미지 배열 복사본
      blockXmlArr: []     // 각 workspace의 XML 상태
    });

  // 실행 버튼들
  const [btn_toggle, setBtn_toggle] = useState(true);
  const [pauseToggle, setPauseToggle] = useState(false); // true: 일시정지 상태


  // 키보드 상태 트래킹
  const [keysPressed, setKeysPressed] = useState({}); // 눌린 키 상태를 저장하는 객체
   /** ─────────────── 캔버스 그리기 ─────────────── **/
  const draw = () => {
    const canvas = canvasRef.current;
    // eslint-disable-next-line
    canvas.width = canvas.width;// 캔버스의 너비를 다시 할당, 캔버스 내부 내용 지워짐
  };
  // 실행할 작품
  const { projectId } = useParams();

// 점수창 모달
const [showScoreModal, setShowScoreModal] = useState(false);

// 이 안에서 window에 할당해야 함!
useEffect(() => {
  window.openScoreModal = () => setShowScoreModal(true);
  window.closeScoreModal = () => setShowScoreModal(false);

  // 컴포넌트 unmount 시 window에서 제거해주면 더 좋음
  return () => {
    delete window.openScoreModal;
    delete window.closeScoreModal;
  };
}, []);

  /** ─────────────── 초기 로딩 ─────────────── **/
  useEffect(() => {
    
    defineMyBlocks(); // 사용자 정의 블록 등록
     // 👉 로딩용 더미 오브젝트 삽입 (index: 0)
    imgArr.current.push({
      img: new Image(),
      url: '/uploads/loading.png',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      angle: 0,
      moveDirection: 90,
      hidden: true,
      index: 0
    });
    setWorkspaceReady(true);
    let isMounted = true; // 컴포넌트가 마운트된 상태인지 체크
  
    if (projectId) {
      (async () => {
        try {
          console.log("🔍 불러오는 프로젝트 ID:", projectId);
          window.cloneArr = [];
          await loadProjectToCanvas(
            Number(projectId),
            imgArr,
            blocklyArr,
            blocklyDiv,
            callImgArr,
            setWorkspaceReady
          );
          if (isMounted) { // 컴포넌트가 마운트 상태일 때만 상태 업데이트ㅁ
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
  


  
  /** ─────────────── 이미지 및 Blockly 생성 ─────────────── **/
  
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
    if (!window.running || window.isPaused) return;
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
    
    // 일시정지 시 이동 금지
    if (window.isPaused) return;

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

  // 1. 실행하기 버튼
  const runStartBtnCode = () => {
    window.running = true; // 실행 상태 ON
    // 1. 상태 백업 (깊은 복사 후, img 객체 새로 만들기)
    const newImgArr = imgArr.current.map(item => {
      // 깊은 복사
      const deepCopy = JSON.parse(JSON.stringify(item));

      // 새로운 이미지 객체를 생성하고 URL을 복사하여 설정
      const img = new Image();
      img.src = item.img.src; // 기존 이미지의 src로 새 이미지 객체 생성

      // img를 깊은 복사된 객체의 img에 덮어쓰기
      deepCopy.img = img;

      return deepCopy; // 깊은 복사된 item 반환
    });

    const newBlockXmlArr = blocklyArr.current.map(ws =>
      Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws))
    );

    // 상태 업데이트
    setBackupState(prevState => ({
      ...prevState,
      imgArr: newImgArr,
      blockXmlArr: newBlockXmlArr
    }));

    console.log('시작으로 변환전 이미지', imgArr.current);

    // 2. 실행
    blocklyArr.current.forEach((workspace, index) => {
      generateStart(workspace, imgArr, index, 'start_btn');
      const code = imgArr.current[index]?.code;
      console.log('실행되는 코드 ',index,' : ',code);
      if (code) {
        runGeneratedCode(code, index, false);
      }
    });
  };

  // 2. 멈추기 버튼에서 이미지를 복원할 때
  const runStopBtnCode = () => {
    window.running = false; // 실행 상태 OFF
    window.cloneArr = [];
    // 1. 작업공간 초기화: 기존 작업공간 및 블록 초기화
    blocklyArr.current.forEach((workspace, index) => {
      workspace.clear();  // 기존 워크스페이스 내용을 지움
    });

    // 이미지 복원: imgPromises 사용하여 이미지가 모두 로드될 때까지 기다림
    const imgPromises = backupState.imgArr.map(item => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = item.img.src; // deep copy에서 저장된 이미지를 사용
        // 이미지가 로드되었을 때
        img.onload = () => {
          // img 객체가 로드된 후 imgArr.current에 추가
          imgArr.current[item.index] = {
            ...item,
            img, // 로드된 img 객체로 복원
          };
          resolve(); // 로드 완료 후 resolve 호출
        };
        // 이미지 로딩 실패 시 처리
        img.onerror = (err) => {
          console.error('이미지 로딩 실패:', err);
          reject(err); // 로딩 실패 시 reject
        };
      });
    });

    // 모든 이미지가 로드될 때까지 기다림
    Promise.all(imgPromises)
      .then(() => {
        // 이미지가 모두 로드된 후 블록 복원 작업 진행
        blocklyArr.current.forEach((ws, index) => {
          const xmlString = backupState.blockXmlArr[index];
          if (xmlString) {
            const xml = Blockly.utils.xml.textToDom(xmlString);
            Blockly.Xml.domToWorkspace(xml, ws);
          } else {
            console.error(`블록 복원 실패: 인덱스 ${index}의 XML이 존재하지 않습니다.`);
          }
        });

        // 캔버스 리렌더링
        callImgArr(); // 이미지를 모두 복원한 후 캔버스를 다시 그리기
        setWorkspaceReady(true); // 작업공간 준비 완료 상태 업데이트
      })
      .catch(err => {
        console.error("이미지 로딩 중 오류가 발생했습니다:", err);
      });

  };
  
  function runStartBtnCodeWithReset() {
    runStartBtnCode();
    setBtn_toggle(false); // 실행 중 상태 고정
    setPauseToggle(false);
    window.isPaused = false;
  }
  
  function runStopBtnCodeWithReset() {
    window.location.reload();
    
  }
  function start_toggle(){
    if(!btn_toggle){
      setBtn_toggle(true); // 버튼 토글
      return;
    }
    setBtn_toggle(false);
  };

  function pause_toggle() {
    // 일시정지
    if (!pauseToggle) {
      window.isPaused = true;
      setPauseToggle(true);
      // 실행 상태여야만 일시정지 허용
      return;
    }
    // 다시시작(일시정지 해제)
    window.isPaused = false;
    setPauseToggle(false);
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
    window.running=false;
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

  // 내부 useEffect
  useEffect(() => {
    const cleanup = registerWhackableClickListener({
      imgArr,
      canvasRef,
      callImgArr,
    });
    return () => cleanup();
  }, []);
  
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
              width="800"
              height="500"
              style={{ border: '1px solid', backgroundColor: 'transparent' }}
            />
            <div className="button-blockly mt-3">
              {btn_toggle && <button onClick={()=>{runStartBtnCodeWithReset()}}>▶️ 실행하기</button>}
              {!btn_toggle && <button onClick={()=>{runStopBtnCodeWithReset()}}>⏹️ 정지하기</button> }
              {!btn_toggle && !pauseToggle && (
                <button onClick={()=>{pause_toggle()}}>⏸️ 일시정지</button>
              )}
              {!btn_toggle && pauseToggle && (
                <button onClick={()=>{pause_toggle()}}>▶️ 다시 시작</button>
              )}
            </div>
          </div>
        </div>

        <div className="blockly-area" style={{ display: 'none' }}>
          <div ref={blocklyDiv}></div>
        </div>
      </div>

      {/* 점수가 존재하면 종료 블럭을 만날 때만 점수 출력 */}
      {showScoreModal && (
        <ScoreModal
          score={window.score}
          onClose={() => {navigate('/share'); runStopBtnCodeWithReset();}}
          onRetry={()=> {setShowScoreModal(false); runStopBtnCodeWithReset();}}
        />
      )}
    </div>
  );
}
export default ShareCanvas;