import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './wepChat.css';

const WepChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [nickname, setNickname] = useState("Anonymous");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const stompClientRef = useRef(null);

  // 로그인 체크
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("accessToken"));
    localStorage.getItem("nickname") && setNickname(localStorage.getItem("nickname"));
  }, []);

  // STOMP 클라이언트 설정
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("accessToken");
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws-chat"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/public", ({ body }) => {
          setMessages(prev => [...prev, JSON.parse(body)]);
        });
      },
      onStompError: (err) => console.error("STOMP Error", err)
    });
    client.activate();
    stompClientRef.current = client;
    return () => client.deactivate();
  }, [isLoggedIn]);

  const sendMessage = () => {
    if (!isLoggedIn) return alert("로그인 후 이용해주세요.");
    if (!inputMessage.trim()) return;
    const chatMessage = { sender: nickname, content: inputMessage };
    stompClientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(chatMessage)
    });
    setInputMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg, i) =>
          <div key={i} className="chat-message">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};

export default WepChat;
