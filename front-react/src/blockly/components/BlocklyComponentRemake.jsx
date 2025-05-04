import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import * as ko from 'blockly/msg/ko';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal } from 'rsuite';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import RegisterBlockGenerator from '../blocks/blockGenerator';
import runGeneratedCode from '../blocks/codeRunner';
import { generateStart, generateStartKey } from '../blocks/generateAndStoreCode';
import defineMyBlocks from '../blocks/myBlockJSON';
import toolboxXML from '../blocks/myBlocks';
import ticoTheme from '../blocks/ticoTheme';
import "../components/BlocklyComponent.css";
import { drawSpeechBubble } from '../functions/appearances/bubbleUtils';
import { drawScoreText } from '../functions/cals/calFunctions';
import { registerWhackableClickListener } from '../games/whackMoleGame';
import { handleDeleteProject } from '../utils/deleteProject';
import { loadProjectToCanvas } from '../utils/loadProjectDetail';
import { handleSaveProject } from "../utils/saveProject";
import ObjectControlPanel from './ObjectControl';
import ObjectSelectPage from './ObjectSelectPage';
import ProjectModal from './ProjectModal';

Blockly.setLocale(ko);

function RemakeCanvas() {
  // Refs & States
  const canvasRef = useRef(null);
  const imgArr = useRef([]);
  const blocklyArr = useRef([]);
  const blocklyDiv = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const panningRef = useRef(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState([]);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const currentProjectId = useRef(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [showObjectSelect, setShowObjectSelect] = useState(false);
  const [keysPressed, setKeysPressed] = useState({}); // 눌린 키 상태를 저장하는 객체

  const location = useLocation();
  const mode = location.state?.mode; // 기본값은 remake
  const remakeProjectId = location.state?.remakeProjectId ?? location.state?.projectId;

  // 시작 상태 백업
  const [backupState, setBackupState] = useState({
    imgArr: [],         // 이미지 배열 복사본
    blockXmlArr: []     // 각 workspace의 XML 상태
  });

  // 실행 버튼들
  const [btn_toggle, setBtn_toggle] = useState(true);
  const [pauseToggle, setPauseToggle] = useState(false); // true: 일시정지 상태
  
  // 1. 진입 시 원본 프로젝트 자동 로딩 (리메이크)
  useEffect(() => {
    window.running=false;
    if (!remakeProjectId) return;
    defineMyBlocks();

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
    
    window.cloneArr = [];
    loadProjectToCanvas(
      remakeProjectId,
      imgArr,
      blocklyArr,
      blocklyDiv,
      callImgArr,
      setWorkspaceReady
    ).then((projectData) => {
      // 모드별 제목 처리
    if (mode === 'remake') {
        currentProjectId.current = null; // 새 프로젝트로 저장
        setProjectTitle('[리메이크] ' + (projectData?.title || ''));
    } else {
        currentProjectId.current = remakeProjectId; // 기존 프로젝트 id
        setProjectTitle(projectData?.title || '');
      }
    }).catch(() => {
      alert('프로젝트 불러오기 실패!');
    });
    // eslint-disable-next-line
  }, []);

  // 이미지 + Blockly 작업공간 생성 함수 (원본에서 복사)
  const callimage = (imgUrl) => {
    const img = new Image();
    img.src = `http://localhost:8081${imgUrl}`;
    img.onload = () => {
      imgArr.current.push({
        img,
        url: imgUrl,
        x: canvasRef.current.width / 2 - 50 / 2,
        y: canvasRef.current.height / 2 - 100 / 2,
        width: 50,
        height: 100,
        angle: 0,
        moveDirection: 90,
        index: imgArr.current.length,
        hidden: false,
        isClone: false,
      });
      callImgArr();
      const blocklyDivElement = document.createElement('div');
      blocklyDivElement.id = `blockly${imgArr.current.length - 1}`;
      blocklyDivElement.style.height = '800px';
      blocklyDivElement.style.width = '1200px';
      blocklyDiv.current.appendChild(blocklyDivElement);

      const workspace = Blockly.inject(blocklyDivElement, {
        toolbox: toolboxXML(),
        theme: ticoTheme,
        move: { scrollbars: { horizontal: false, vertical: false }, drag: false, wheel: false },
        zoom: { controls: true, wheel: false, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2, pinch: true }
      });

      blocklyArr.current.push(workspace);
      workspace.index = imgArr.current.length - 1;
      setWorkspaceReady(true);

      workspace.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(workspace);
        if (imgArr.current[workspace.index]) {
          imgArr.current[workspace.index].code = code;
        }
      });

      blocklyArr.current.forEach((item, index) => {
        const blocklyDivElement = document.getElementById(`blockly${index}`);
        blocklyDivElement.style.display = (index === (blocklyArr.current.length - 1) ? 'block' : 'none');
      });
    };
    img.onerror = (error) => {
      console.error('이미지 로드 실패:', error);
      alert('이미지 로드에 실패했습니다.');
    };
  };

  const callImgArr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    canvas.width = canvas.width;
    const updatedPositions = [];
    const allObjects = [...imgArr.current, ...(window.cloneArr || [])];
    allObjects.forEach((item) => {
      updatedPositions.push({ x: item.x, y: item.y, hidden: item.hidden });
      if (item.hidden) return;
      context.save();
      context.translate(item.x + item.width / 2, item.y + item.height / 2);
      context.rotate((item.angle * Math.PI) / 180);
      const scaleX = item.flipX ? -1 : 1;
      const scaleY = item.flipY ? -1 : 1;
      context.scale(scaleX, scaleY);
      context.globalAlpha = item.opacity ?? 1;
      context.filter = `hue-rotate(${item.hue ?? 0}deg) brightness(${item.brightness ?? 100}%)`;
      context.drawImage(
        item.img,
        -item.width / 2,
        -item.height / 2,
        item.width,
        item.height
      );
      context.restore();
      if (item.bubbleText) {
        drawSpeechBubble(context, item);
      }
    });
    setImagePosition(updatedPositions);
    if (window.elapsedTime > 0) {
      window.drawTimerText();
    }
    if (window.showScore) {
      drawScoreText();
    }
  };

  // 마우스 관련 이벤트 (그대로 복사)
  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    e.preventDefault();
    let imgIndex = -1;
    imgArr.current.forEach((refItem, index) => {
      if (
        offsetX >= refItem.x &&
        offsetX <= refItem.x + refItem.width &&
        offsetY >= refItem.y &&
        offsetY <= refItem.y + refItem.height
      ) {
        if (!refItem.isBackground) {
          setSelectedImageIndex(index);
          startPosRef.current = { x: offsetX - refItem.x, y: offsetY - refItem.y };
          if (index > imgIndex) {
            imgIndex = index;
          }
        }
      };
    });
    panningRef.current = imgIndex >= 0;
    blocklyArr.current.forEach((item, index) => {
      const blocklyDivElement = document.getElementById(`blockly${index}`);
      if (imgIndex === -1) return;
      if (blocklyDivElement) {
        blocklyDivElement.style.display = 'none';
        if (index === imgIndex) {
          blocklyDivElement.style.display = 'block';
        }
      }
    });
  };

  const handleMouseUp = () => { panningRef.current = false; };
  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    e.preventDefault();
    setCoordinates({ x: offsetX, y: offsetY });
    if (
      selectedImageIndex !== null &&
      panningRef.current &&
      e.target === canvasRef.current
    ) {
      imgArr.current[selectedImageIndex].x = offsetX - startPosRef.current.x;
      imgArr.current[selectedImageIndex].y = offsetY - startPosRef.current.y;
      callImgArr();
    }
  };

  // 파일 이미지 업로드
  const selectimg = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axiosInstance.post('/api/project/uploadImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { imageUrl } = await response.json();
      callimage(imageUrl);
    } catch (err) {
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
    event.target.value = '';
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

  // 실행/멈춤/저장 등 버튼 핸들러 (복사)
  function runStartBtnCodeWithReset() {
    runStartBtnCode();
    start_toggle();

    setPauseToggle(false);
    window.isPaused = false;
  }
  function runStopBtnCodeWithReset() {
    runStopBtnCode();
    start_toggle();

    setPauseToggle(false);
    window.isPaused = false;
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

  // 이미지 및 해당 작업공간(Blockly div 포함) 삭제 함수
  function imgDel(index) {
    // 1. 현재 오브젝트에 연결된 blockly 작업공간 div를 DOM에서 완전히 삭제
    const blocklyDivElement = document.getElementById(`blockly${index}`);
    if (blocklyDivElement) {
      blocklyDivElement.remove();
    }

    // 2. imgArr와 blocklyArr에서 해당 인덱스의 요소를 제거 (데이터 동기화)
    imgArr.current.splice(index, 1);  // 이미지(오브젝트) 배열에서 제거
    const workspaceToRemove = blocklyArr.current[index];
    if (workspaceToRemove) workspaceToRemove.dispose(); // 블록리 작업공간 내부도 정리
    blocklyArr.current.splice(index, 1);  // 작업공간 배열에서 제거

    // 3. 남아있는 모든 작업공간 div의 id와 workspace.index를 실제 배열 인덱스에 맞게 재정렬
    blocklyArr.current.forEach((workspace, i) => {
      const oldId = `blockly${workspace.index}`; // 기존 id (혹시 id가 뒤섞였을 경우 대비)
      const newId = `blockly${i}`;               // 새로운 id (배열 인덱스 기준)
      const div = document.getElementById(oldId);
      if (div) div.id = newId;                   // id를 새로운 값으로 변경
      workspace.index = i;                       // 내부 workspace.index도 동기화
    });

    // 4. blocklyDiv 부모에 남아있는 자식 div 중 blocklyArr 길이보다 많은(div가 중복된) 경우 초과분을 삭제
    //    → 실제 blockly 작업공간 수와 DOM 상의 blockly div 수를 항상 일치시키기 위함
    const blocklyDivParent = blocklyDiv.current;
    if (blocklyDivParent) {
      const childDivs = Array.from(blocklyDivParent.children);
      childDivs.forEach((div, idx) => {
        if (idx >= blocklyArr.current.length) div.remove();
      });
    }

    // 5. imgArr 내부 각 오브젝트의 index 필드도 순서대로 다시 할당 (렌더링 시 UI 동기화 목적)
    imgArr.current.forEach((obj, i) => {
      obj.index = i;
    });

    // 6. 남은 오브젝트가 있으면 첫 번째 오브젝트를 선택하고, 그에 해당하는 blockly div만 표시 (나머지는 숨김)
    //    → 오브젝트가 하나도 없으면 선택 해제
    if (imgArr.current.length > 0) {
      setSelectedImageIndex(0);
      blocklyArr.current.forEach((workspace, idx) => {
        const div = document.getElementById(`blockly${idx}`);
        if (div) div.style.display = idx === 0 ? 'block' : 'none';
      });
    } else {
      setSelectedImageIndex(null);
    }

    // 7. 캔버스를 다시 렌더링하여 UI 동기화
    callImgArr();
  }

  // Whackable 복제 클릭 리스너
  useEffect(() => {
    const cleanup = registerWhackableClickListener({
      imgArr,
      canvasRef,
      callImgArr,
    });
    return () => cleanup();
  }, []);

  // 선택된 이미지마다 blocklyDiv display 관리
  useEffect(() => {
    blocklyArr.current.forEach((workspace, i) => {
      const blocklyDivElement = document.getElementById(`blockly${workspace.index}`);
      if (blocklyDivElement) {
        const isVisible =
          selectedImageIndex === null
            ? workspace.index === 0
            : workspace.index === selectedImageIndex;
            
        blocklyDivElement.style.display = isVisible ? 'block' : 'none';
      }
    });
  
    // 선택된 작업공간 리사이즈 강제 호출
    if (selectedImageIndex !== null && blocklyArr.current[selectedImageIndex]) {
      setTimeout(() => {
        Blockly.svgResize(blocklyArr.current[selectedImageIndex]);
      }, 0);
    }
  }, [selectedImageIndex]);

  // 렌더링
  return (
    <div className="blockly-container">
      {workspaceReady && (
        <RegisterBlockGenerator imgArr={imgArr} callImgArr={callImgArr} blocklyArr={blocklyArr} coordinates={coordinates} />
      )}
      <div className="editor-wrapper">
        <div className='canvas-and-objects'>
          <div
            className="canvas-area"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <h6> 🖱 마우스좌표  ( x좌표 : {coordinates.x} &nbsp; y좌표 : {coordinates.y})</h6>
            <canvas
              ref={canvasRef}
              width="800"
              height="500"
              style={{ border: '1px solid', backgroundColor: 'transparent' }}
            />
          </div>
          <div className="object-panel-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            {imgArr.current.map((obj, index) => (
              <div key={index} className="object-panel-item">
                <ObjectControlPanel
                  object={obj}
                  onUpdate={(updatedObj) => {
                    imgArr.current[index] = updatedObj;
                    callImgArr();
                  }}
                  i={index}
                  onDelete={() => imgDel(index)}
                  isSelected={selectedImageIndex === index}
                  isExpanded={selectedImageIndex === index} // 요게 핵심!
                  onClick={() => {
                    setSelectedImageIndex(prev => (prev === index ? null : index));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="blockly-area">
          <div ref={blocklyDiv}></div>
          <div className="project-title-input" style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="projectTitle">📝 작품명: </label>
            <input
              id="projectTitle"
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="작품 이름을 입력하세요"
            />
          </div>
          <div className="button-blockly">
            <input type="file" id="imgInput" accept="image/*" style={{ display: 'none' }} onChange={selectimg} />
            <button onClick={() => setShowObjectSelect(true)}>➕ 요소 추가</button>
            {btn_toggle && <button onClick={()=>{runStartBtnCodeWithReset();start_toggle();}}>▶️ 실행하기</button>}
            {!btn_toggle && <button onClick={()=>{runStopBtnCodeWithReset(); start_toggle();}}>⏹️ 정지하기</button> }
            {!btn_toggle && !pauseToggle && (
              <button onClick={pause_toggle}>⏸️ 일시정지</button>
            )}
            {!btn_toggle && pauseToggle && (
              <button onClick={pause_toggle}>▶️ 다시 시작</button>
            )}
            <button onClick={() => handleSaveProject(imgArr, blocklyArr, currentProjectId.current, projectTitle)}>
              💾 저장하기
            </button>
            {currentProjectId.current && (
            <button onClick={() => handleDeleteProject(currentProjectId.current)}>
                🗑️ 삭제하기
            </button>
            )}
          </div>
          <ProjectModal
            show={showProjectModal}
            onClose={() => setShowProjectModal(false)}
            projectList={projectList}
            onSelect={async (project) => {
              try {
                window.cloneArr = [];
                await loadProjectToCanvas(
                  project.projectId,
                  imgArr,
                  blocklyArr,
                  blocklyDiv,
                  callImgArr,
                  setWorkspaceReady
                );
                currentProjectId.current = project.projectId;
                setProjectTitle(project.title);
                setShowProjectModal(false);
              } catch (err) {
                alert('불러오기 실패!');
              }
            }}
          />
        </div>
      </div>
      <Modal open={showObjectSelect} onClose={() => setShowObjectSelect(false)} size="lg">
        <Modal.Header><Modal.Title>오브젝트 선택</Modal.Title></Modal.Header>
        <Modal.Body>
          <ObjectSelectPage
            onComplete={(selectedObjects) => {
              setShowObjectSelect(false);
              selectedObjects.forEach(obj => {
                callimage(obj.blocklyObjectFilePath);
              });
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RemakeCanvas;
