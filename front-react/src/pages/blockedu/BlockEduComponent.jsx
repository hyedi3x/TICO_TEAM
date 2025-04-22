import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import * as ko from 'blockly/msg/ko';
import { javascriptGenerator } from 'blockly/javascript';
import defineMyBlocks from '../../blockly/blocks/myBlockJSON';
import "./BlockEduComponent.css";
import eduToolboxXML6 from './edublock/eduToolboxXML';
import {useNavigate, useParams } from 'react-router-dom';
import './Modal.css';
import ticoTheme from '../../blockly/blocks/ticoTheme';
import axios from 'axios';

Blockly.setLocale(ko);

function BlockEduComponent() {

  const navigate = useNavigate();
  const blocklyDiv = useRef(null);
  const [workspace, setWorkspace] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [xmlText, setXmlText] = useState('');
  const [showModal, setShowModal] = useState(false); // 모달 상태

  const { quizId } = useParams();
  const [answerXml, setAnswerXml] = useState(null);
  const [quizDescription, setQuizDescription] = useState(null);
  const [textareaContent, setTextareaContent] = useState(''); // textarea 상태
  const [quizData, setQuizData] = useState(null); // 퀴즈 데이터 상태
  
  const [currentImageSrc, setCurrentImageSrc] = useState('');

  const user_uuid = localStorage.getItem("user_uuid");
  console.log("user_uuid : ", user_uuid);
  const isEmp_id = /^\d{5}$/.test(user_uuid); // 5자리 숫자 정규식 체크, \d =	숫자 한 자리 (0~9), {5}	= 앞의 패턴 5번 반복

  
  useEffect(() => {

    const user_uuidCheck = localStorage.getItem("user_uuid");
    if (!user_uuidCheck) {
      alert("로그인 후 사용 가능합니다.");
      navigate("/login"); // 로그인 페이지로 이동
    }

    const fetchAnswerXml = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/quiz/answer?quizId=${quizId}`);
        const data = response.data;
        setQuizData(data); 
        setAnswerXml(data.answer_xml);
        setQuizDescription(data.quiz_description);
        console.log("정답 XML:", data.answer_xml);
        setCurrentImageSrc(data.quiz_img); // quizData 로딩 후 설정
      } catch (error) {
        console.error("정답 XML 불러오기 실패:", error);
      }
    };
    fetchAnswerXml();
    defineMyBlocks();
    // 시작블럭과 출력블럭을 위한 자바스크립트 코드 생성기 정의
    javascriptGenerator.forBlock['start_btn'] = () => 'start_btn();\n';
    javascriptGenerator.forBlock['text_print_to_textarea'] = function(block, generator) {
      const value_value = generator.valueToCode(block, 'INPUT', javascriptGenerator.ORDER_ATOMIC);
      const code = `outputTextarea(${value_value});\n`;
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
        toolbox: eduToolboxXML6(),
        theme: ticoTheme,
        move: { scrollbars: true, drag: false, wheel: false },
        zoom: { controls: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2, pinch: true }
      });

      javascriptGenerator.init(newWorkspace); // 자바스크립트 코드 생성기 초기화, init() 메서드는 이 생성기를 새로운 특정 워크스페이스(newWorkspace)와 연결하며 생성기 내부상태를 초기화
      javascriptGenerator.nameDB_.setVariableMap(newWorkspace.getVariableMap()); // 워크스페이스에 정의된 변수명과 연결
      
      setWorkspace(newWorkspace);

      newWorkspace.addChangeListener(() => {

        const code = javascriptGenerator.workspaceToCode(newWorkspace);
        setGeneratedCode(code);

        let xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(newWorkspace));
        xml = xml
          .replace(/ id="[^"]+"/g, '') 
          // replace("찾을 문자", "바꿀 문자") []는 문자집합(하나이상), ^는 부정을 의미,  g는 전역검색(해당하는 모든 문자들을 찾는다.)
          // id"로 시작하고 "로 끝나는(내부는"가 아닌 한개 이상 문자) 모든 문자들을 ""로 바꾼다.
          .replace(/ xmlns="[^"]+"/g, '')
          .replace(/ x="[^"]+"/g, '')
          .replace(/ y="[^"]+"/g, '');

        setXmlText(xml);
      });
    }
  }, [workspace]);

  // 사용자 정의 변수명을 유지한 채 코드만 표시용으로 출력하는 함수
  const rawCodeForDisplay = () => {
    if (!workspace) return '';
    const tempGen = Object.create(javascriptGenerator); // generator 생성
    tempGen.nameDB_ = new Blockly.Names(tempGen.RESERVED_WORDS_); // 새로운 이름 데이터베이스(nameDB_) 객체를 생성
    tempGen.nameDB_.setVariableMap(null); // 유니크 변수 비활성화
    return tempGen.workspaceToCode(workspace); // 원래 변수명으로 변환된 코드
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
      setGeneratedCode(finalCode);

      try {
        new Function(finalCode)();
      } catch (error) {
        console.error('코드 실행 중 오류:', error);
      }
    }
  };

  // 정답 확인 버튼
  const handleCheckAnswer = () => {
    if (xmlText.trim() === answerXml?.trim()) { // 정확도 향상을 위해 trim() 사용
      setShowModal(true); // ✨ 정답 모달 열기
      if (!isEmp_id) { // 사원번호가 아닐 경우에만 푼 문제 업데이트, DB 관리
       fetchQUiZData(quizId);
      }
    } else {
      alert("❌ 정답이 일치하지 않습니다. 다시 확인해보세요!");
    }
  };
  
  const fetchQUiZData = async (quizId) => {
    try {
      const response = await axios.put("http://localhost:8081/quiz/eduQuiz", {
        user_uuid: user_uuid,
        quiz_id: quizId
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      // 상태 코드가 200이 아니면 에러를 던짐
      if (response.status !== 200) throw new Error('푼 문제 업데이트 실패');
      console.log(response);
    } catch (error) {
      console.error('퀴즈 데이터 저장하기 중 오류 발생:', error);
    }
  }
  // 출력창 초기화
  const resetTextarea = () => {
    setTextareaContent(''); // textarea 초기화
  }

  // 이미지 토글

  const handleToggle = () => {
    if (currentImageSrc === quizData.quiz_img) {
      setCurrentImageSrc(quizData.answer_img);
    } else {
      setCurrentImageSrc(quizData.quiz_img);
    }
  }    

  return (
    <div className="e_blockly-container">
      
      <div className="e_textarea-div">
        <div className="e_code-output">
          <button className="imgToggle" onClick={()=>handleToggle()}>🔎정답 보기</button>
          <img className="e_quiz-img" src={currentImageSrc} alt="퀴즈1" />
          
          <p>생성된 코드</p>
          <textarea value={rawCodeForDisplay()} readOnly/>
        </div>
        <div className="e_xml-output">
        {quizData ? (
          <p>문제 {quizData.quiz_id}번. {quizData.quiz_title}</p>
        ) : (
          <p>퀴즈 정보를 불러오는 중...</p>
        )}
        <textarea value={quizDescription} readOnly/>

        <p>출력 화면 (실행하기 클릭)</p>
        <textarea value={textareaContent} readOnly/>

        </div>
      </div>

        <div className="e_editor-wrapper">
          <div className="e_blockly-area">

            <p>블럭코딩 작업 공간</p>
            <div ref={blocklyDiv}></div>

            <div className="e_button-blockly">
              <button onClick={()=>navigate("/eduList")}>☰ 목록으로 돌아가기</button>
              <button onClick={resetTextarea}>🗑️ 출력창 초기화</button>
              <button onClick={runStartBtnCode}>▶️ 실행하기</button>
              <button onClick={handleCheckAnswer}>✅ 정답 확인하기</button>
            </div>s
          </div>
        </div>
      
      {/* 🎉 모달 */}
      {showModal && (
        <div className="e_modal-overlay" onClick={() => setShowModal(false)}> {/* 모달 외부 클릭 시 닫기 */}
          <div className="e_modal-box" onClick={(e) => e.stopPropagation()}>
            {/* e.stopPropagation() = 이벤트 버블링을 막음, HTML 요소에서 이벤트(클릭, 마우스 오버 등)가 발생했을 때, 그 이벤트가 해당 요소의 부모 요소로 거슬러 올라가면서 부모 요소에 등록된 동일한 이벤트 리스너들을 순차적으로 실행하는 동작 */}
            <h3>🎉 정답입니다!</h3>
            <p>훌륭해요! 정답과 일치합니다 😊</p>
            <button onClick={() => setShowModal(false)}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockEduComponent;
