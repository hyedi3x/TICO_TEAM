import React, { useRef, useState } from 'react';
import { List, Grid, Row, Col, Tabs } from 'rsuite';
import MyCalendar from './MyCalendar';
import RecentNotices from './RecentNotices';
import { IoPersonCircle } from "react-icons/io5";
import './home.css';

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
                <UserInfo />
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

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState({
    profileImage: null,
    emp_id: 'hongkil',
    emp_name: '홍길동',
    dep_id: 'DEP003',
    job_id: '개발자',
    emp_email: 'hongkildong@naver.com',
    emp_phone: '010-7777-7777',
    emp_home: '서울시 용산구',
    emp_birth: '2001-11-07'
  });

  const fileInputRef = useRef(null);

  const imgChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo({ ...userInfo, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="user-info">
      <h2>회원 정보</h2>
      <div className="profile-image-container">
        {userInfo.profileImage ? (
          <img src={userInfo.profileImage} alt="프로필 사진" className="profile-image" />
        ) : (
          <div className="icon-placeholder" onClick={() => fileInputRef.current.click()}>
            <IoPersonCircle size="10em" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={imgChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      </div>
      <div className="userInfoText">
        ID : {userInfo.emp_id}<br />
        이름 : {userInfo.emp_name}<br />
        부서 ID : {userInfo.dep_id}<br />
        직무 ID : {userInfo.job_id}<br />
        이메일 : {userInfo.emp_email}<br />
        전화번호 : {userInfo.emp_phone}<br />
        주소 : {userInfo.emp_home}<br />
        생년월일 : {userInfo.emp_birth}
      </div>
    </div>
  );
};

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
