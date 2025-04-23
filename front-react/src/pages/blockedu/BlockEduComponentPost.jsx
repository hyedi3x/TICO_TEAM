import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import * as ko from 'blockly/msg/ko';
import { javascriptGenerator } from 'blockly/javascript';
import defineMyBlocks from '../../blockly/blocks/myBlockJSON';
import "./BlockEduComponentPost.css";
import eduToolboxXML from './edublock/eduToolboxXML';
import {useNavigate, useParams } from 'react-router-dom';
import './Modal.css';
import html2canvas from 'html2canvas';
import ticoTheme from '../../blockly/blocks/ticoTheme';
import axios from 'axios';
import axiosInstance from '../login/social/utils/axiosInstance';

Blockly.setLocale(ko);

function BlockEduComponentPost() {

  const navigate = useNavigate();
  const blocklyDiv = useRef(null);
  const [workspace, setWorkspace] = useState(null);
  const [answer_xml, setAnswer_xml] = useState('');
  const [quiz_title, setQuiz_title] = useState('');
  const [quiz_description, setQuiz_description] = useState('');
  const [quiz_level, setquiz_level] = useState('');
  const [quiz_img, setQuiz_img] = useState('');
  const [answer_img, setAnswer_img] = useState('');
  
  const [textareaContent, setTextareaContent] = useState(''); // xml textarea

  useEffect(() => {
    defineMyBlocks();
    // 시작블럭과 출력블럭을 위한 자바스크립트 코드 생성기 정의
    javascriptGenerator.forBlock['start_btn'] = () => 'start_btn();\n';
    javascriptGenerator.forBlock['text_print_to_textarea'] = function(block, generator) {
      const value = generator.valueToCode(block, 'INPUT', javascriptGenerator.ORDER_ATOMIC); //특정 블록의 입력값을 JS 코드로 바꿔줌, valueToCode() 함수는 세 개의 인자를 필요
      // javascriptGenerator.ORDER_ATOMIC : 블록의 입력값을 원자적으로 처리하는 우선순위
      const code = `outputTextarea(${value});\n`;
      return code;
    };
  }, []);

  // 블록코딩 작업공간에 textarea 출력 함수 추가
  window.outputTextarea = (value) => setTextareaContent((prev) => prev + value + '\n'); 

  // Blockly 작업공간 초기화
  useEffect(() => {
    if (blocklyDiv.current && !workspace) {
      const blocklyDivElement = document.createElement('div');
      blocklyDivElement.id = 'blocklyWorkspace';
      blocklyDivElement.style.height = '650px';
      blocklyDivElement.style.width = '700px';
      blocklyDiv.current.appendChild(blocklyDivElement);

      const newWorkspace = Blockly.inject(blocklyDivElement, {
        toolbox: eduToolboxXML(),
        theme: ticoTheme,
        move: { scrollbars: true, drag: false, wheel: false },
        zoom: { controls: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2, pinch: true }
      });

      javascriptGenerator.init(newWorkspace); // 자바스크립트 코드 생성기 초기화, init() 메서드는 이 생성기를 새로운 특정 워크스페이스(newWorkspace)와 연결하며 생성기 내부상태를 초기화
      javascriptGenerator.nameDB_.setVariableMap(newWorkspace.getVariableMap()); // 워크스페이스에 정의된 변수명과 연결
      
      setWorkspace(newWorkspace);

      newWorkspace.addChangeListener(() => {
        javascriptGenerator.nameDB_.reset();
        javascriptGenerator.nameDB_.setVariableMap(null); // ✅ 자동 유니크화 방지

        const code = javascriptGenerator.workspaceToCode(newWorkspace);

        let xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(newWorkspace));
        xml = xml
          .replace(/ id="[^"]+"/g, '') 
          // replace("찾을 문자", "바꿀 문자") []는 문자집합(하나이상), ^는 부정을 의미,  g는 전역검색(해당하는 모든 문자들을 찾는다.)
          // id"로 시작하고 "로 끝나는(내부는"가 아닌 한개 이상 문자) 모든 문자들을 ""로 바꾼다.
          .replace(/ xmlns="[^"]+"/g, '')
          .replace(/ x="[^"]+"/g, '')
          .replace(/ y="[^"]+"/g, '');
        setAnswer_xml(xml);
      });
    }
  }, [workspace]);

  // 사용자 정의 변수명을 유지한 채 코드만 표시용으로 출력하는 함수
  const rawCodeForDisplay = () => {
    if (!workspace) return '';
    const copyJs = Object.create(javascriptGenerator); // generator 복사
    copyJs.nameDB_ = new Blockly.Names(copyJs.RESERVED_WORDS_); // 예약어 목록 문자열을 변수명 관리 클래스에 전달하여 새로운 이름 데이터베이스(nameDB_) 객체를 생성 (예약어 사용 방지)
    copyJs.nameDB_.setVariableMap(null); // 유니크 변수 비활성화, 변수 맵핑을 사용하지 않겠다
    return copyJs.workspaceToCode(workspace); // 원래 변수명으로 변환된 코드
  };

  // 실행 버튼
  const runStartBtnCode = () => {
    if (workspace) {
      const topBlocks = workspace.getTopBlocks();
      const allBlocksCode = [];

      topBlocks.forEach((block) => {
        if (block.type === 'start_btn') {
          const code = javascriptGenerator.blockToCode(block);
          allBlocksCode.push(code);
        }
      });
      const finalCode = allBlocksCode.join('\n');
      try {
        new Function(finalCode)();
      } catch (error) {
        console.error('코드 실행 중 오류:', error);
      }
    }
  };

  // 출력창 초기화
  const resetTextarea = () => {
    setTextareaContent(''); // textarea 초기화
  }
  
  // 블록코딩 캡처하기
  function captureBlocklyToImage() {
    const targetDiv = document.getElementById('blocklyWorkspace');
    const trashAndZoomImgs = targetDiv.querySelectorAll('.blocklyZoom, .blocklyTrash');
  
    // 휴지통, 줌컨트롤 숨기기
    trashAndZoomImgs.forEach(item => item.style.display = 'none');
  
    // html2canvas 또는 html-to-image 캡처 실행
    html2canvas(targetDiv, {
      useCORS: true,
      backgroundColor: null
    }).then(result => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = result.toDataURL('image/png');
      setAnswer_img(img.src);
      const captureDiv = document.querySelector('.e2_capture-div');
      if (captureDiv) {
        captureDiv.innerHTML = ''; // 전 이미지 제거
        captureDiv.appendChild(img);
      }
      
      // 다시 보이게
      trashAndZoomImgs.forEach(el => el.style.display = '');
    });
  }

  // 저장하기
  const saveQuiz = async () => {
    try {
      const response = await axiosInstance.post('/eduBlock/PostQuiz', {
        quiz_title: quiz_title,
        quiz_description: quiz_description,
        quiz_level: quiz_level,
        quiz_img: quiz_img,
        answer_img: answer_img,
        answer_xml: answer_xml,
        emp_id: localStorage.getItem('user_uuid'), // 사원번호
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      console.log('성공:', response.data);
      navigate('/eduList'); // 성공 후 이동할 페이지
    } catch (error) {
      console.error('실패:', error);
      alert('문제 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 퀴즈 이미지 업로드
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuiz_img(reader.result);
        console.log('퀴즈 이미지:', reader.result); // base64 인코딩된 이미지 데이터
      };
      reader.readAsDataURL(file);
    } else {
      setQuiz_img(null);
      console.log('퀴즈 이미지 없음');
    }
  };

  // 변화 값 저장
  const handleInputChange = (event, kind)=>{
    const { value } = event.target;
    switch(kind) {
      case 'quiz_title':
        setQuiz_title(value);
        console.log(value);
        break;
      case 'quiz_description':
        setQuiz_description(value);
        console.log(value);
        break;
      case 'quiz_level':
        setquiz_level(value);
        console.log(value);
        break;
      case 'answer_xml':
        setAnswer_xml(value);
        console.log(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="e2_blockly-container">
      
      <div className="e2_textarea-div">
        <div className="e2_code-output">
          
          <p>문제 제목</p>
          <input type="text" placeholder='문제 제목' required onChange={(event) =>handleInputChange(event, 'quiz_title')}/>
          
          <p>문제 설명</p>
          <textarea placeholder='문제 설명' required onChange={(event) =>handleInputChange(event, 'quiz_description')}/>
          
          <p>문제 난이도</p>
          <div className="radio-group">
            <label>
              <input type="radio" name="quiz_level" value="쉬움" onChange={(event) => handleInputChange(event, 'quiz_level')} /> 쉬움
            </label>
            <label>
              <input type="radio" name="quiz_level" value="보통" onChange={(event) => handleInputChange(event, 'quiz_level')} /> 보통
            </label>
            <label>
              <input type="radio" name="quiz_level" value="어려움" onChange={(event) => handleInputChange(event, 'quiz_level')} /> 어려움
            </label>
            <label>
              <input type="radio" name="quiz_level" value="매우 어려움" onChange={(event) => handleInputChange(event, 'quiz_level')} /> 매우 어려움
            </label>
          </div>
          
          <p>문제 이미지</p>
          <input type="file" accept="image/*" required onChange={handleFileChange}/>

          <p>캡처 이미지</p>
          <div className="e2_capture-div"></div>
        </div>
        
        <div className="e2_xml-output">
          <p>xml 코드</p>
          <textarea value={answer_xml} readOnly required onChange={(event) =>handleInputChange(event, 'answer_xml')}/>

          <p>생성된 코드</p>
          <textarea value={rawCodeForDisplay()} readOnly/>

          <p>출력 화면 (실행하기 클릭)</p>
          <textarea value={textareaContent} readOnly/>
        </div>
      </div>

        <div className="e2_editor-wrapper">
          <div className="e2_blockly-area">

            <p>블럭코딩 작업 공간 [ 변수명 영어 ]</p>
            <div className="e2_block-div" ref={blocklyDiv}></div>

            <div className="e2_button-blockly">
              
              <button onClick={resetTextarea}>🗑️ 출력창 초기화</button>
              <button onClick={runStartBtnCode}>▶️ 실행하기</button>
              <button onClick={()=> captureBlocklyToImage()}>📸 캡처하기</button>
            </div>
            <div className="e2_button-blockly">
              <button onClick={()=>navigate("/eduList")}>☰ 목록으로 돌아가기</button>
              <button onClick={()=> saveQuiz()}>💾 저장하기</button>
            </div>
          </div>
        </div>
    </div>
  );
}

export default BlockEduComponentPost;
