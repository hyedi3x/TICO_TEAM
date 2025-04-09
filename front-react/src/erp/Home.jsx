import React, { useState } from 'react';
import { List, Grid, Row, Col, Tabs } from 'rsuite';
import MyCalendar from './MyCalendar';
import RecentNotices from './RecentNotices';
import './home.css';
import ErpDTO from './ErpDTO';

const Home = ({ onNoticeClick }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <Grid fluid>
      <Row>
        {/* 왼쪽: 캘린더 & 할일 목록 */}
        <Col xs={24} md={12}>
          <div className="calendar-todo">
            <MyCalendar setSelectedDate={setSelectedDate} />
            <TodoList date={selectedDate} />
          </div>
        </Col>

        {/* 오른쪽: 탭 - 회원정보 / 공지사항 / 알림 */}
        <Col xs={24} md={12}>
          <div className="tabs-content">
            <Tabs defaultActiveKey="1">
              <Tabs.Tab eventKey="1" title="회원 정보">
                <ErpDTO/>
              </Tabs.Tab>
              <Tabs.Tab eventKey="2" title="회사 공지">
                <RecentNotices onNoticeClick={onNoticeClick} />
              </Tabs.Tab>
              <Tabs.Tab eventKey="3" title="알림">
                <Notifications />
              </Tabs.Tab>
            </Tabs>
          </div>
        </Col>
      </Row>
    </Grid>
  );
};

export default Home;

const Notifications = () => {
  const notifications = [
    { id: 1, message: '새로운 메시지가 도착했습니다.', time: '10:00' },
    { id: 2, message: '프로젝트 마감일이 다가옵니다.', time: '14:00' },
  ];

  return (
    <div className="notifications">
      <h2>알림</h2>
      <List>
        {notifications.map(({ id, message, time }) => (
          <List.Item key={id}>
            {message} ({time})
          </List.Item>
        ))}
      </List>
    </div>
  );
};

const TodoList = ({ date }) => {
  const list = getTodoList(date);
  if (!list.length) return <p>해당 날짜의 일정이 없습니다.</p>;

  return (
    <div className="todo-list">
      <List bordered>
        {list.map(item => (
          <List.Item key={item.time}>
            <div>{item.time}</div>
            <div>{item.title}</div>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

function getTodoList(date) {
  if (!date) return [];
  const day = date.getDate();
  switch (day) {
    case 10:
      return [
        { time: '10:30 am', title: 'Meeting' },
        { time: '12:00 pm', title: 'Lunch' },
      ];
    case 15:
      return [
        { time: '09:30 pm', title: '제품 소개 미팅' },
        { time: '12:30 pm', title: '고객 접대' },
        { time: '02:00 pm', title: '디자인 회의' },
        { time: '05:00 pm', title: '제품 테스트' },
        { time: '06:30 pm', title: '보고서 작성' },
      ];
    default:
      return [];
  }
}
