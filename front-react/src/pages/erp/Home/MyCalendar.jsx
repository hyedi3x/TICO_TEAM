import React from 'react';
import { Calendar } from 'rsuite';
import './myCalendar.css';

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
      <div className="calendar-cell-schedules">
        {matchingSchedules.slice(0, 2).map((item, index) => (
          <div
            key={index}
            className="calendar-schedule-box"
            style={{ backgroundColor: item.erpScheduleColor || '#3498db' }}
            title={item.erpScheduleTitle}
          >
            {item.erpScheduleTitle.length > 10
              ? item.erpScheduleTitle.slice(0, 10) + '...'
              : item.erpScheduleTitle}
          </div>
        ))}
        {matchingSchedules.length > 2 && (
          <div className="calendar-more-schedules">+{matchingSchedules.length - 2}개 더보기</div>
        )}
      </div>
    );
  };

  return (
    <div className="my-calendar-wrapper">
    <Calendar
      compact={false}  // ❗ false로 설정
      renderCell={renderCell}
      onSelect={handleSelect} // 날짜 클릭
      style={{ width: '100%', height: '100%' }}
    />
    </div>
  );
};

export default MyCalendar;
