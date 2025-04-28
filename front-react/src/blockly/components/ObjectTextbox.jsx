import React, { useEffect, useState } from 'react';
import { Button, Input, InputPicker, Popover, Whisper, Divider } from 'rsuite';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import { FaTrash } from 'react-icons/fa';

// 폰트 종류
const fontOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Noto Sans KR', value: 'Noto Sans KR' },
  { label: 'Nanum Gothic', value: 'Nanum Gothic' },
  { label: 'Nanum Myeongjo', value: 'Nanum Myeongjo' },
  { label: 'Gmarket Sans', value: 'Gmarket Sans' },
  { label: 'Pretendard', value: 'Pretendard' },
  { label: 'BM JUA', value: 'BM JUA' },
];

const ObjectTextbox = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [customColor, setCustomColor] = useState('#000000');
  const userUuid = localStorage.getItem("user_uuid");

  const [savedTextboxes, setSavedTextboxes] = useState([]);

  /* 저장된 글상자 가져오기 */
  const fetchSavedTextboxes = () => {
    axiosInstance.get(`/api/blockly-textboxes/${userUuid}`)
      .then(res => {
        setSavedTextboxes(res.data || []);
      })
      .catch(err => {
        console.error("❌ 글상자 불러오기 실패:", err);
        setSavedTextboxes([]);
      });
  };

  useEffect(() => {
    fetchSavedTextboxes();
  }, []);

  /* 글상자 추가하기 */
  const handleAddTextbox = async () => {
    if (!text.trim()) {
      alert("텍스트를 입력해주세요!");
      return;
    }

    const textboxData = {
      userUuid: userUuid,
      text: text,
      fontSize: fontSize,
      color: color,
      fontFamily: fontFamily,
    };

    try {
      await axiosInstance.post('/api/blockly-textboxes', textboxData);

      // 선택 추가 없이 저장만
      alert("✅ 글상자 저장 완료!");
      fetchSavedTextboxes();  // 새로고침
      setText('');
      setFontSize(24);
      setColor('#000000');
      setFontFamily('Arial');
    } catch (err) {
      console.error("❌ 글상자 저장 실패:", err);
      alert("❌ 글상자 저장 중 오류가 발생했습니다.");
    }
  };

  /* 글상자 삭제 */
  const handleDeleteTextbox = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    axiosInstance.delete(`/api/blockly-textboxes/${id}`)
      .then(() => {
        alert("✅ 글상자 삭제 완료!");
        fetchSavedTextboxes();  // 목록 새로고침
      })
      .catch(err => {
        console.error("❌ 글상자 삭제 실패:", err);
        alert("❌ 삭제 실패");
      });
  };

  /* 팝오버 안에 들어갈 색상 선택 UI */
  const popover = (
    <Popover title="색상 선택">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input
          type="color"
          value={customColor}
          onChange={(value) => setCustomColor(value)}
        />
        <Button appearance="primary" size="sm" onClick={() => {
          setColor(customColor);
        }}>
          색상 선택
        </Button>
      </div>
    </Popover>
  );

  return (
    <div className="objectTextbox-container">
      <h4>📝 글상자 추가</h4>
      <Input
        placeholder="텍스트를 입력하세요"
        value={text}
        onChange={value => setText(value)}
      />
      <Input
        placeholder="글자 크기 (예: 24)"
        type="number"
        value={fontSize}
        onChange={value => setFontSize(Number(value))}
        style={{ marginTop: 10 }}
      />
      <div style={{ marginTop: 10 }}>
        <Whisper placement="top" trigger="click" speaker={popover}>
          <Button appearance="ghost" block>🎨 색상 선택</Button>
        </Whisper>
        <div style={{ marginTop: 5, height: 30, backgroundColor: color, borderRadius: 5 }}></div>
      </div>
      <InputPicker
        placeholder="폰트 선택"
        data={fontOptions}
        value={fontFamily}
        onChange={value => setFontFamily(value)}
        style={{ marginTop: 10 }}
        block
      />

      <Button appearance="primary" style={{ marginTop: 20 }} onClick={handleAddTextbox}>
        ➕ 추가하기
      </Button>

      <Divider />

      {/* 저장된 글상자 목록 */}
      <h5>📚 저장된 글상자</h5>
      <div className="objectTextbox-saved-grid">
        {savedTextboxes.length === 0 ? (
          <p>저장된 글상자가 없습니다.</p>
        ) : (
          savedTextboxes.map((item, index) => (
            <div key={item.textboxId || `textbox-${index}`} className="objectTextbox-saved-item">
              <div
                className="objectTextbox-preview"
                style={{
                  fontSize: item.fontSize,
                  fontFamily: item.fontFamily,
                  color: item.color,
                }}
                onClick={() => {
                  onComplete([{
                    type: 'text',
                    id: item.textboxId,
                    text: item.text,
                    fontSize: item.fontSize,
                    color: item.color,
                    fontFamily: item.fontFamily,
                  }]);

                }}
              >
                {item.text}
              </div>

              {/* 삭제 버튼 */}
              <Button
                size="xs"
                color="red"
                appearance="ghost"
                onClick={() => handleDeleteTextbox(item.textboxId)}
              >
                <FaTrash />
              </Button>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default ObjectTextbox;
