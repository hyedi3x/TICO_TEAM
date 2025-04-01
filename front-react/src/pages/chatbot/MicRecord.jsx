import './micRecord.css';
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

function MicRecord() {
  const [recState, setRecState] = useState(false); // 녹음 상태 (true: 녹음 중, false: 중지)
  const mediaRec = useRef(null); // 녹음 기능 객체
  const audioChunks = useRef([]); // 오디오 데이터 저장
  const [chatList, setChatList] = useState([]); // 채팅 메시지 목록
  const [chats, setChats] = useState(''); // 현재 입력된 채팅
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 오류 상태

  // 채팅 입력 핸들러
  const inputChange = (e) => {
    setChats(e.target.value);
  };

  // 채팅 전송 핸들러
  const handleSend = () => {
    setError(null); // 에러 초기화
    if (chats.trim()) {
      setChatList([...chatList, { text: chats, sender: 'user' }]); // 사용자 메시지 추가
      sendTextToSpring(chats, 'N'); // 스프링 부트로 전송
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
    setError(null); // 에러 초기화
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRec.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRec.current.ondataavailable = event => {
          audioChunks.current.push(event.data);
        };

        mediaRec.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          audioChunks.current = []; // 메모리 초기화
          sendAudio(audioBlob);
        };

        mediaRec.current.start();
        setRecState(true);
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError') {
          setError('마이크 접근 권한이 없습니다.');
        } else if (err.name === 'NotFoundError') {
          setError('마이크를 찾을 수 없습니다.');
        } else {
          setError('마이크를 사용할 수 없습니다. 연결을 확인해주세요.');
        }
      });
  };

  // 녹음 중지
  const stopRec = () => {
    if (mediaRec.current) {
      mediaRec.current.stop();
      setRecState(false);
    }
  };

  // 오디오 파일을 서버로 전송
  const sendAudio = (audioBlob) => {
    const audioFile = new File([audioBlob], "recorded_audio.webm", { type: "audio/webm" });
    const formData = new FormData();
    formData.append('audio', audioFile);

    fetch('http://localhost:5000/speech_to_text', {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.transcript) {
          setChatList([...chatList, { text: data.transcript, sender: 'bot' }]);
          sendTextToSpring(data.transcript, 'Y');
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

  // 스프링 부트로 텍스트 전송
  const sendTextToSpring = (text, record) => {
    fetch('http://localhost:8081/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg: text, record: record, filePath: null }),
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
        const response = await fetch('http://localhost:8081/api/messages');
        const data = await response.json();
        console.log('Fetched data:', data);

        if (Array.isArray(data)) {
          setChatList(data);
        } else {
          console.error('Invalid data format:', data);
          setError('메시지 데이터를 불러오는 데 문제가 있습니다.');
          setChatList([]);
        }
      } catch (err) {
        setError('메시지 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="chat-wrap">
      {/* 메시지 목록 */}
      <div className="messages">
        {Array.isArray(chatList) ? (
          chatList.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))
        ) : (
          <div className="error">메시지 데이터를 불러오는 중 오류가 발생했습니다.</div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="input-wrap">
        {loading && <div className="loading">텍스트 변환 중...</div>}
        {error && <div className="error">오류: {error}</div>}
        
        <div className="input-row">
          <input
            type="text"
            value={chats}
            onChange={inputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
          />
          
          {/* 채팅 입력 또는 음성 입력 */}
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
