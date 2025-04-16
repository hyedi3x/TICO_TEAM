import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import * as ko from 'blockly/msg/ko';
import { javascriptGenerator } from 'blockly/javascript';
import defineMyBlocks from '../../blockly/blocks/myBlockJSON';
import "./BlockEduComponentPost.css";
import eduToolboxXML6 from './edublock/eduToolboxXML';
import { useNavigate, useParams } from 'react-router-dom';
import './Modal.css';
import html2canvas from 'html2canvas';
import ticoTheme from '../../blockly/blocks/ticoTheme';

Blockly.setLocale(ko);

function BlockEduComponentPut() {
  const navigate = useNavigate();
  const blocklyDiv = useRef(null);
  const { quiz_id } = useParams(); // 수정 시 quiz_id 가져오기

  const [workspace, setWorkspace] = useState(null);
  const [answer_xml, setAnswer_xml] = useState('');
  const [quiz_title, setQuiz_title] = useState('');
  const [quiz_description, setQuiz_description] = useState('');
  const [quiz_level, setquiz_level] = useState('');
  const [quiz_img, setQuiz_img] = useState('');
  const [answer_img, setAnswer_img] = useState('');
  const [textareaContent, setTextareaContent] = useState('');
  const [emp_id, setEmp_id] = useState('');

  const [restoredXml, setRestoredXml] = useState(false); // 복원 여부 체크

  // 문제 불러오기 - 기존 데이터 가져오기
  useEffect(() => {
    if (quiz_id) {
      fetch(`http://localhost:8081/quiz/answer?quizId=${quiz_id}`)
        .then(res => res.json())
        .then(data => {
          console.log('문제 데이터:', data);
          setQuiz_title(data.quiz_title);
          setQuiz_description(data.quiz_description);
          setquiz_level(data.quiz_level);
          setQuiz_img(data.quiz_img);
          setAnswer_img(data.answer_img);
          setAnswer_xml(data.answer_xml);
          setEmp_id(data.emp_id); // 등록한 사원 기록용
        })
        .catch(error => {
          console.error('문제 불러오기 오류:', error);
        });
    }
  }, []);

  // 작업공간 복원
  useEffect(() => {
    if (workspace && answer_xml && !restoredXml) { // 작업공간과 xml이 준비되고 restoredXml로 한번만 실행
      try {
        const xmlDom = Blockly.utils.xml.textToDom(answer_xml);
        Blockly.Xml.domToWorkspace(xmlDom, workspace);
        setRestoredXml(true); // 한번만 실행

        // 💡 블럭들이 겹치지 않도록 첫 블록들 이동
        const topBlocks = workspace.getTopBlocks(true); // true = 정렬 순서대로
        topBlocks.forEach((block, idx) => {
        block.moveBy(idx* 150, 0); // x좌표를 50px씩 이동
        });
      } catch (err) {
        console.error("XML 불러오기 실패:", err);
      }
    }
  }, [workspace, answer_xml, restoredXml]);

  // 사용자 블럭 실행 함수 정의
  useEffect(() => {
    defineMyBlocks();
    javascriptGenerator.forBlock['start_btn'] = () => 'start_btn();\n';
    javascriptGenerator.forBlock['text_print_to_textarea'] = function (block, generator) {
      const value = generator.valueToCode(block, 'INPUT', javascriptGenerator.ORDER_ATOMIC);
      return `outputTextarea(${value});\n`;
    };
  }, []);

  window.outputTextarea = (value) => setTextareaContent((prev) => prev + value + '\n');

  // 블록코딩 작업공간 생성
  useEffect(() => {
    if (blocklyDiv.current && !workspace) {
      const blocklyDivElement = document.createElement('div');
      blocklyDivElement.id = 'blocklyWorkspace';
      blocklyDivElement.style.height = '650px';
      blocklyDivElement.style.width = '700px';
      blocklyDiv.current.appendChild(blocklyDivElement);

      const newWorkspace = Blockly.inject(blocklyDivElement, {
        toolbox: eduToolboxXML6(),
        theme: ticoTheme,
        move: { scrollbars: true, drag: false, wheel: false },
        zoom: { controls: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2, pinch: true }
      });

      // 실행용 코드 생성기 준비 -  Blockly workspace 등록 
      javascriptGenerator.init(newWorkspace);
      javascriptGenerator.nameDB_.setVariableMap(newWorkspace.getVariableMap());
      setWorkspace(newWorkspace);

      newWorkspace.addChangeListener(() => {
        javascriptGenerator.nameDB_.reset();
        javascriptGenerator.nameDB_.setVariableMap(null);
        let xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(newWorkspace));
        xml = xml.replace(/ id="[^"]+"/g, '')
                 .replace(/ xmlns="[^"]+"/g, '')
                 .replace(/ x="[^"]+"/g, '')
                 .replace(/ y="[^"]+"/g, '');
        setAnswer_xml(xml);
      });
    }
  }, [workspace]);

  // 화면 출력용 코드 생성 - 사용자에게 보여주는 코드 용도
  const rawCodeForDisplay = () => {
    if (!workspace) return '';
    const copyJs = Object.create(javascriptGenerator);
    copyJs.nameDB_ = new Blockly.Names(copyJs.RESERVED_WORDS_);
    copyJs.nameDB_.setVariableMap(null);
    return copyJs.workspaceToCode(workspace);
  };

  // 블록코딩 작업공간에서 생성된 코드 실행
  const runStartBtnCode = () => {
    if (workspace) {
      const topBlocks = workspace.getTopBlocks();
      const allBlocksCode = topBlocks.filter(block => block.type === 'start_btn').map(block => javascriptGenerator.blockToCode(block));
      try {
        new Function(allBlocksCode.join('\n'))();
      } catch (e) {
        console.error('실행 중 오류:', e);
      }
    }
  };

  // 출력창 초기화
  const resetTextarea = () => setTextareaContent('');

  // 블록코딩 작업공간 캡처
  const captureBlocklyToImage = () => {
    const targetDiv = document.getElementById('blocklyWorkspace');
    const trashAndZoomImgs = targetDiv.querySelectorAll('.blocklyZoom, .blocklyTrash');
    trashAndZoomImgs.forEach(item => item.style.display = 'none');
    html2canvas(targetDiv, { useCORS: true, backgroundColor: null }).then(result => {
      const img = new Image();
      img.src = result.toDataURL('image/png');
      setAnswer_img(img.src);
      const captureDiv = document.querySelector('.e2_capture-div');
      if (captureDiv) {
        captureDiv.innerHTML = '';
        captureDiv.appendChild(img);
      }
      trashAndZoomImgs.forEach(el => el.style.display = '');
    });
  };

  // 문제 저장하기 - id가 존재해서 수정요청으로 사용됨
  const saveQuiz = () => {
    fetch('http://localhost:8081/eduBlock/PostQuiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id, quiz_title, quiz_description, quiz_level, quiz_img, answer_img, answer_xml}),
    })
    .then(res => res.json())
    .then(data => {
      alert('수정 성공');
      navigate('/EMPEduList');
    })
    .catch(err => {
      console.error('수정 오류:', err);
      alert('문제 저장에 실패했습니다.');
    });
  };

  // 파일 업로드 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQuiz_img(reader.result);
      reader.readAsDataURL(file);
    } else {
      setQuiz_img(null);
    }
  };

  // 문제 제목, 설명, 난이도 변경 핸들러
  const handleInputChange = (e, kind) => {
    const value = e.target.value;
    if (kind === 'quiz_title') setQuiz_title(value);
    else if (kind === 'quiz_description') setQuiz_description(value);
    else if (kind === 'quiz_level') setquiz_level(value);
    else if (kind === 'answer_xml') setAnswer_xml(value);
    console.log('변경된 값:', value);
  };

  return (
    <div className="e2_blockly-container">
      <div className="e2_textarea-div">
        <div className="e2_code-output">
          <p>{quiz_id}번 문제 제목</p>
          <input type="text" value={quiz_title} onChange={e => handleInputChange(e, 'quiz_title')} />

          <p>문제 설명</p>
          <textarea value={quiz_description} onChange={e => handleInputChange(e, 'quiz_description')} />

          <p>문제 난이도</p>
          <div className="radio-group">
            {['쉬움', '보통', '어려움', '매우 어려움'].map(level => (
              <label key={level}>
                <input type="radio" name="quiz_level" value={level} checked={quiz_level === level} onChange={e => handleInputChange(e, 'quiz_level')} /> {level}
              </label>
            ))}
          </div>

          <p>문제 이미지 [ 변경 없을 시 원본 유지 ]</p>
          <div className="e2_quizimg-div">{quiz_img && <img src={quiz_img} alt="퀴즈 이미지" />}</div>
          <input type="file" accept="image/*" onChange={handleFileChange} />

          <p>캡처 이미지</p>
          <div className="e2_capture-div">{answer_img && <img src={answer_img} alt="정답 이미지" />}</div>
        </div>

        <div className="e2_xml-output">
          <p>xml 코드</p>
          <textarea value={answer_xml} readOnly />

          <p>생성된 코드</p>
          <textarea value={rawCodeForDisplay()} readOnly />

          <p>출력 화면 (실행하기 클릭)</p>
          <textarea value={textareaContent} readOnly />
        </div>
      </div>

      <div className="e2_editor-wrapper">
        <div className="e2_blockly-area">
          <p>블럭코딩 작업 공간 [ 변수명 영어 ]</p>
          <div className="e2_block-div" ref={blocklyDiv}></div>

          <div className="e2_button-blockly">
            <button onClick={resetTextarea}>🗑️ 출력창 초기화</button>
            <button onClick={runStartBtnCode}>▶️ 실행하기</button>
            <button onClick={captureBlocklyToImage}>📸 캡처하기</button>
          </div>

          <div className="e2_button-blockly">
            <button onClick={() => navigate("/EMPEduList")}>☰ 목록으로 돌아가기</button>
            <button onClick={saveQuiz}>💾 수정하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockEduComponentPut;