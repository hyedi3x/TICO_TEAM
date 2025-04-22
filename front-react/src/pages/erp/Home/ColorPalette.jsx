import React, { useCallback, useEffect, useState } from 'react';
import { Popover, Whisper, Button, Input, toaster, Message } from 'rsuite';
import './colorPalette.css';
import axiosInstance from '../../login/social/utils/axiosInstance';

// 🎨 기본 색상 목록 (유저가 직접 등록하지 않아도 항상 보이는 색상들)
const defaultColors = ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#3498db'];

const ColorPalette = ({ selectedColor, onChange }) => {
  const empId = localStorage.getItem('user_uuid'); // 로그인된 사용자 ID
  const [colors, setColors] = useState(defaultColors); // 보여지는 전체 색상 목록
  const [customColor, setCustomColor] = useState('#000000'); // 새로 추가할 색상

  // 🎯 유저가 저장한 색상 목록을 불러오는 함수
  const fetchUserColors = useCallback(async () => {
    if (!empId) return;

    try {
      const res = await axiosInstance.get(`/api/user-colors/${empId}`);
      const userColors = res.data.map(item => item.empColor);
      
      // 기본 색상과 겹치지 않도록 필터링 후 병합
      const uniqueUserColors = userColors.filter(c => !defaultColors.includes(c));  // 필터링
      setColors([...defaultColors, ...uniqueUserColors]);   // 기본 색상 + 사용자 정의 색상 배열을 합침

    } catch (err) {
      console.error('유저 색상 로드 실패', err);
    }
  }, [empId]);

  // 컴포넌트 마운트 시 사용자 색상 목록 가져오기
  useEffect(() => {
    fetchUserColors();
  }, [fetchUserColors]);

  // 색상 추가 버튼 클릭 시 동작
  const handleAddColor = async () => {
    if (!empId || !customColor) return;

    // 이미 존재하는 색상인 경우 단순 선택만
    if (colors.includes(customColor)) {
      toaster.push(<Message type="info">이미 등록된 색상입니다</Message>, { placement: 'topEnd' });
      onChange(customColor);
      return;
    }

    try {
      await axiosInstance.post('/api/user-colors', {
        empId,
        empColor: customColor
      });

      setColors([...colors, customColor]);   // UI 목록에 추가
      onChange(customColor);                 // 현재 선택 색상 변경

      toaster.push(<Message type="success">색상이 추가되었습니다</Message>, { placement: 'topEnd' });

    } catch (err) {
      toaster.push(<Message type="error">색상 추가 실패</Message>, { placement: 'topEnd' });
      console.error(err);
    }
  };

  // ❌ 사용자 정의 색상 삭제
  const handleDeleteColor = async () => {
    if (!empId || !selectedColor) return;

    // 기본 색상은 삭제 불가
    if (defaultColors.includes(selectedColor)) {
      toaster.push(<Message type="warning">기본 색상은 삭제할 수 없습니다</Message>, { placement: 'topEnd' });
      return;
    }

    try {
      await axiosInstance.delete('/api/user-colors', {
        data: { empId, empColor: selectedColor }
      });

      setColors(colors.filter(c => c !== selectedColor)); // 목록에서 제거
      onChange(''); // 선택 초기화

      toaster.push(<Message type="success">색상이 삭제되었습니다</Message>, { placement: 'topEnd' });

    } catch (err) {
      toaster.push(<Message type="error">색상 삭제 실패</Message>, { placement: 'topEnd' });
      console.error(err);
    }
  };

  // 🎨 직접 색상 고르는 팝오버 UI
  const popover = (
    <Popover title="직접 색상 선택">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input
          type="color"
          value={customColor}
          onChange={(value) => setCustomColor(value)}
          style={{ width: '100%' }}
        />
        <Button appearance="primary" size="sm" onClick={handleAddColor}>
          추가하기
        </Button>
      </div>
    </Popover>
  );

  return (
    <div className="color-palette">
      {/* 상단 삭제 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>일정 색상</span>
        <Button
          appearance="subtle"
          size="xs"
          onClick={handleDeleteColor}
          style={{ padding: '0 5px', fontSize: 14 }}
        >
          🗑️
        </Button>
      </div>

      {/* 색상 목록 UI */}
      <div className="color-palette">
        {colors.map((color) => ( 
          <div
            key={color}
            className={`color-circle ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)} // 색깔 선택 후, Home.jsx에 콜백
          />
        ))}

        {/* + 버튼 클릭 시 팝오버 오픈 */}
        <Whisper placement="top" trigger="click" speaker={popover}>
          <div className="color-circle plus">+</div>
        </Whisper>
      </div>
    </div>
  );
};

export default ColorPalette;
