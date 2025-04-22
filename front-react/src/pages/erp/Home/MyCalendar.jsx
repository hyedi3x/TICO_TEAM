import React from 'react';
import { Calendar } from 'rsuite';

const MyCalendar = ({ onDateSelect, schedules }) => {
  // 날짜를 년월일 단위로만 비교하기 위해 시간 제거
  const normalizeDate = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());  // 날짜 정규화

  // 셀 클릭 시 해당 날짜에 포함된 일정 전달
  const handleSelect = (date) => {
    const selected = schedules.filter(item => {   // 클릭한 날짜에 해당하는 일정만 다시 필터링해서 selected라는 배열에 담음
      const start = normalizeDate(new Date(item.erpScheduleStart));
      const end = normalizeDate(new Date(item.erpScheduleEnd));
      const current = normalizeDate(date);

      return current >= start && current <= end;
    });

    onDateSelect(date, selected); // 콜백
  };

  // 각 셀에 점을 렌더링
  const renderCell = (date) => {
    const current = normalizeDate(date);  // 시간 제거 : 연월일만 비교

    // 모든 일정들을 필터링. 해당 날짜 셀에 일정이 포함되는지 확인.
    const matchingSchedules = schedules.filter(item => {
      const start = normalizeDate(new Date(item.erpScheduleStart));
      const end = normalizeDate(new Date(item.erpScheduleEnd));
      return current >= start && current <= end;
    });

    if (matchingSchedules.length === 0) return null;  // 일정이 없으면 아무것도 표시 안함.

    // 일정이 있다면 점으로 표시
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        {matchingSchedules.slice(0, 3).map((item, index) => (
          <div
            key={index}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: item.erpScheduleColor || '#3498db',  // 일정마다 선택된 색상 값
              margin: '0 1px'
            }}
          />
        ))}
        {matchingSchedules.length > 3 && (
          <div
            style={{
              fontSize: 10,
              marginLeft: 2,
              color: '#999'
            }}
          >+{matchingSchedules.length - 3}</div>  // 일정이 4개 이상이면 +N으로 표시
        )}
      </div>
    );
  };

  return (
    <Calendar
      compact
      renderCell={renderCell}
      onSelect={handleSelect} // 날짜 클릭
      style={{ width: 320 }}
    />
  );
};

export default MyCalendar;
