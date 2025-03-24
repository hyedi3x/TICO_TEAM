import './micRecord.css';
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

function MicRecord() {
  const [recState, setRecState] = useState(false); // 녹음 상태 관리 (true: 녹음 중, false: 녹음 정지)
  const mediaRec = useRef(null); // 기기 오디오 녹음 기능
  const audioChunks = useRef([]); // audioChunks : 녹음 기능을 담는 변수
  const [chatList, setChatList] = useState([]); // 채팅 메시지 목록
  const [chats, setChats] = useState(''); // 채팅 입력
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(null); // 오류 상태 추가

  // 채팅 입력 핸들러
  const inputChange = (e) => {
    setChats(e.target.value);
  };
  
  // handleSend (채팅 전송 핸들러)
  const handleSend = () => {
    setError(null); // 에러 메시지 초기화
    if (chats.trim()) {
      setChatList([...chatList, { text: chats, sender: 'user' }]); // 메시지 목록에 사용자 메시지 추가
      sendTextToSpring(chats, 'N'); // 스프링 부트로 텍스트 데이터 전송
      setChats('');
    }
  };
  
  // Enter 키 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // 녹음 시작
  const startRec = () => {
    setError(null); // 에러 메시지 초기화
    navigator.mediaDevices.getUserMedia({ audio: true }) // 사용자 기기 장치 접근 권한 요청 (audio)
      .then(stream => {
        mediaRec.current = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // 기기 녹음 객체 webm type으로 생성 
        mediaRec.current.ondataavailable = event => { // 녹음 기능 이벤트 핸들러
          audioChunks.current.push(event.data); // 오디오 데이터 삽입
        };

        mediaRec.current.onstop = () => { // 녹음 중지 이벤트 핸들러, 녹음 완료 시점을 정확하게 감지 
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' }); // Blob : 녹음 데이터는 여러 chunk로 나뉨, chunk들을 하나의 연속된 데이터로 합침
          audioChunks.current = []; // 녹음 중지 시, 필요하지 않은 리소스를 초기화 (메모리 누수 방지, 다음 녹음 준비)
          sendAudio(audioBlob); // Blob 서버로 오디오 데이터를 전송
        };

        mediaRec.current.start(); // 녹음 시작
        setRecState(true); // 녹음 상태 업데이트
      })

      .catch((err) => {
        // 마이크 접근 실패 시 에러 메시지 설정
        if (err.name === 'NotAllowedError') {
          setError('마이크 접근 권한이 없습니다.');
        } else if (err.name === 'NotFoundError') {
          setError('마이크를 찾을 수 없습니다. 마이크를 연결해주세요.');
        } else {
          setError('마이크를 사용할 수 없습니다. 마이크 연결을 확인해주세요.');
        }
      });;
  };

  // 녹음 중지
  const stopRec = () => {
    if (mediaRec.current) {
      mediaRec.current.stop();
      setRecState(false); // 녹음 상태 업데이트
    }
  };

  // 오디오 전송 (바이너리 파일을 File 형태로 변환)
  const sendAudio = (audioBlob) => {
    const audioFile = new File([audioBlob], "recorded_audio.webm", { type: "audio/webm" }); // 오디오 Blob을 File 객체로 변환
    const formData = new FormData(); // FormData 객체 생성, 오디오나 영상 데이터 전송 시 권장
    formData.append('audio', audioFile); // FormData에 audioFile 추가

    fetch('http://localhost:5000/speech_to_text', { // 서버로 오디오 파일 전송 (POST 요청, 파이썬 서버)
      method: 'POST',
      body: formData,
    })
      .then(res => res.json()) // 응답 JSON으로 파싱
      .then(data => {
        if (data.transcript) {
          setChatList([...chatList, { text: data.transcript, sender: 'bot' }]); // 음성 인식 결과를 메시지 목록에 추가
          sendTextToSpring(data.transcript, 'Y'); // 스프링 부트로 텍스트 데이터 전송
        } else {
          console.error("Error:", data.error);
          setError('음성 인식에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('서버 연결에 실패했습니다.');
      });
  };

  // 스프링 부트로 텍스트 데이터 전송
  const sendTextToSpring = (text, record) => {
    fetch('http://localhost:8081/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ msg: text, record: record, filePath: null }), // filePath 추가
    })
      .then(res => res.json())
      .then(data => {
        console.log('스프링 부트 응답:', data);
      })
      .catch(error => {
        console.error('스프링 부트 전송 오류:', error);
      });
  };

  // 스프링 부트에서 메시지 목록 가져오기
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8081/api/messages'); // 스프링 부트 서버에서 메시지 목록 가져오기 (GET 요청)
        const data = await response.json();
        setChatList(data); // 메시지 목록 업데이트
      } catch (err) {
        setError('메시지 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return (
    <div className="chat-wrap">
      {/* 메시지 입력 창 */}
      <div className="messages">
        {chatList.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>

      <div className="input-wrap">
        {loading && <div className="loading">텍스트 변환 중...</div>}
        {error && <div className="error">오류: {error}</div>}
        <div className="input-row">
          <input
            type="text"
            value={chats}
            onChange={inputChange}
            onKeyDown={handleKeyDown} // Enter 키 이벤트 핸들러 추가
            placeholder="메시지를 입력하세요..."
          />
          {/* 채팅 입력 or 마이크 음성 입력  */}
          {chats.trim() ? (
            <div className="send-btn" onClick={handleSend}>
              <FontAwesomeIcon icon={faPaperPlane} className="send-icon" />
            </div>
          ) : (
            <div
              className={`mic-btn ${recState ? 'mic-rec' : 'mic-stop'}`}
              onClick={recState ? stopRec : startRec}
            >
              <FontAwesomeIcon icon={faMicrophone} className="mic-icon" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MicRecord;