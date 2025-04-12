import React from 'react';
import { Calendar } from 'rsuite';

const MyCalendar = ({ onDateSelect, schedules }) => {
  // 날짜를 년월일 단위로만 비교하기 위해 시간 제거
  const normalizeDate = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // 셀 클릭 시 해당 날짜에 포함된 일정 전달
  const handleSelect = (date) => {
    const selected = schedules.filter(item => {
      const start = normalizeDate(new Date(item.erpScheduleStart));
      const end = normalizeDate(new Date(item.erpScheduleEnd));
      const current = normalizeDate(date);

      return current >= start && current <= end;
    });

    onDateSelect(date, selected);
  };

  // 각 셀에 점을 렌더링
  const renderCell = (date) => {
    const current = normalizeDate(date);

    const matchingSchedules = schedules.filter(item => {
      const start = normalizeDate(new Date(item.erpScheduleStart));
      const end = normalizeDate(new Date(item.erpScheduleEnd));
      return current >= start && current <= end;
    });

    if (matchingSchedules.length === 0) return null;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        {matchingSchedules.slice(0, 3).map((item, index) => (
          <div
            key={index}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: item.erpScheduleColor || '#3498db',
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
          >+{matchingSchedules.length - 3}</div>
        )}
      </div>
    );
  };

  return (
    <Calendar
      compact
      renderCell={renderCell}
      onSelect={handleSelect}
      style={{ width: 320 }}
    />
  );
};

export default MyCalendar;
