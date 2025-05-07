import React, { useRef, useState, useEffect } from 'react';
import './objectDraw.css';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import { Button } from 'rsuite';
import { FaTrash } from 'react-icons/fa';

function ObjectDraw({ onComplete }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(3);
  const [title, setTitle] = useState('');
  const [myDrawings, setMyDrawings] = useState([]);
  const [undoStack, setUndoStack] = useState([]);

  const userUuid = localStorage.getItem('user_uuid');

  useEffect(() => {
    fetchMyDrawings();
  }, []);

  /* 내 그림 목록 불러오기 */
  const fetchMyDrawings = async () => {
    try {
      const res = await axiosInstance.get(`/api/blockly-draw/user/${userUuid}`);
      const drawings = res.data.map(drawing => ({
        drawId: drawing.drawId,
        title: drawing.originalName,
        imageUrl: drawing.imageUrl,
      }));
      setMyDrawings(drawings);
    } catch (err) {
      console.error('❌ 그림 목록 불러오기 실패:', err);
    }
  };

  /* 그리기 시작 */
  const handleStart = (e) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current = ctx;
    setIsDrawing(true);

    // 현재 캔버스 상태 저장 (undo를 위해)
    const snapshot = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setUndoStack(prev => [...prev, snapshot]);
  };

  /* 그리는 중 */
  const handleDraw = (e) => {
    if (!isDrawing) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  /** 그리기 종료 */
  const handleEnd = () => {
    if (!isDrawing) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  /* 캔버스 전체 지우기 */
  const handleClear = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setUndoStack([]);
  };

  /* 뒤로가기 (Undo) */
  const handleUndo = () => {
    if (undoStack.length === 0) {
      alert("더 이상 되돌릴 수 없습니다!");
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    const lastSnapshot = undoStack[undoStack.length - 1];
    ctx.putImageData(lastSnapshot, 0, 0);
    setUndoStack(prev => prev.slice(0, -1));
  };

  /* 저장하기 */
  const handleSave = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요!');
      return;
    }

    const dataURL = canvasRef.current.toDataURL('image/png');

    try {
      await axiosInstance.post('/api/blockly-draw/save', {
        imageUrl: dataURL,
        originalName: title,
        userUuid,
      });
      console.log('✅ 저장 성공');
      alert('✅ 저장 완료되었습니다!');
      fetchMyDrawings();
      handleClear();
      setTitle('');
    } catch (err) {
      console.error('❌ 저장 실패:', err);
      alert('저장에 실패했습니다.');
    }
  };

  /** 선택해서 추가하기 */
  const handleAdd = (drawing) => {
    if (!onComplete) return;
    onComplete(prev => {
      const exists = prev.some(obj => obj.id === drawing.drawId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: drawing.drawId,
          blocklyObjectName: drawing.title,
          blocklyObjectFilePath: drawing.imageUrl,
          source: 'draw',
        }
      ];
    });
  };

  /* 그림 삭제하기 */
  const handleDelete = async (drawId) => {
    if (!window.confirm('정말 삭제할까요?')) return;
    try {
      await axiosInstance.delete(`/api/blockly-draw/delete/${drawId}`);
      console.log('🗑️ 삭제 성공:', drawId);
      fetchMyDrawings();
    } catch (err) {
      console.error('❌ 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="new-drawing-wrapper">
      {/* 제목 입력 */}
      <div className="new-drawing-title">
        <input
          type="text"
          value={title}
          placeholder="제목을 입력하세요"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 캔버스 */}
      <div className="new-drawing-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="new-drawing-canvas"
          onMouseDown={handleStart}
          onMouseMove={handleDraw}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
        />
      </div>

      {/* 펜 설정 */}
      <div className="new-drawing-controls">
        <label>
          색상:
          <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
        </label>
        <label>
          굵기:
          <input type="range" min="1" max="20" value={penSize} onChange={(e) => setPenSize(+e.target.value)} />
          {penSize}px
        </label>
      </div>

      {/* 버튼들 */}
      <div className="new-drawing-buttons">
        <button onClick={handleSave}>🖌 저장하기</button>
        <button onClick={handleClear}>🧹 초기화</button>
        <button onClick={handleUndo}>↩️ 뒤로가기</button>
      </div>

      {/* 내가 그린 그림 목록 */}
      <div className="my-drawings-list">
        <h4>🖼 내가 그린 그림들</h4>
        <div className="my-drawings-grid">
          {myDrawings.length > 0 ? myDrawings.map((drawing) => (
            <div key={drawing.drawId} className="my-drawing-item">
              <img
                src={`https://tico.kro.kr${drawing.imageUrl}`}
                alt={drawing.title}
                onClick={() => handleAdd(drawing)}
                className="clickable-drawing"
              />
              <div className="my-drawing-title">{drawing.title}</div>
              <Button
                size="xs"
                color="red"
                appearance="ghost"
                onClick={() => handleDelete(drawing.drawId)}
              >
                <FaTrash />
              </Button>
            </div>
          )) : (
            <div>아직 저장된 그림이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ObjectDraw;
