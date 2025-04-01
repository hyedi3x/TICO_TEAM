import React from 'react';
import { Calendar, Badge } from 'rsuite';

// MyCalendar 컴포넌트를 생성하여 Calendar 컴포넌트를 렌더링하고, 
// setSelectedDate prop을 받아 handleSelect 함수에서 호출합니다.

// Todo 목록을 가져오는 함수(날짜에 따라 일정 표시)
function getTodoList(date) {
  if (!date) {
    return [];
  }
  const day = date.getDate();

  switch (day) {
    case 10:
      return [
        { time: '10:30 am', title: 'Meeting' },
        { time: '12:00 pm', title: 'Lunch' }
      ];
    case 15:
      return [
        { time: '09:30 pm', title: 'Products Introduction Meeting' },
        { time: '12:30 pm', title: 'Client entertaining' },
        { time: '02:00 pm', title: 'Product design discussion' },
        { time: '05:00 pm', title: 'Product test and acceptance' },
        { time: '06:30 pm', title: 'Reporting' }
      ];
    default:
      return [];
  }
}

// 셀 렌더링 함수(일정이 있는 날짜에 배치를 추가)
function renderCell(date) {
  const list = getTodoList(date);

  if (list.length) {
    return <Badge className="calendar-todo-item-badge" />;
  }

  return null;
}

// MyCalendar 컴포넌트 : 달력 컴포넌트
const MyCalendar = ({ setSelectedDate }) => {
  const handleSelect = date => {
    setSelectedDate(date);
  };

  return (
    <Calendar compact renderCell={renderCell} onSelect={handleSelect} style={{ width: 320 }} />
  );
};

export default MyCalendar;