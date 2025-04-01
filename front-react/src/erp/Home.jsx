import React, { useRef, useState } from 'react';
import { List, Grid, Row, Col, Tabs } from 'rsuite';
import MyCalendar from './MyCalendar';
import { IoPersonCircle } from "react-icons/io5";
import './home.css'

// Home 컴포넌트 : 전체 레이아웃을 구성하는 컴포넌트
const Home = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <Grid fluid>
      <Row>
        {/* 왼쪽: 캘린더와 할 일 리스트 */}
        <Col xs={24} md={12}>
          <div className="calendar-todo">
            <MyCalendar setSelectedDate={setSelectedDate} />  {/* MyCalendar 컴포넌트 렌더링 */}
            <TodoList date={selectedDate} />  {/* TodoList 컴포넌트 렌더링, 선택된 날짜를 전달 */}
          </div>
        </Col>

        {/* 오른쪽: 회원정보, 회사공지, 알림 */}
        <Col xs={24} md={12}>
          <div className="tabs-content">
            <Tabs defaultActiveKey="1">
              <Tabs.Tab eventKey="1" title="회원 정보">
                <UserInfo />
              </Tabs.Tab>
              <Tabs.Tab eventKey="2" title="회사 공지">
                <CompanyNotices />
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

// 회원 정보 컴포넌트
const UserInfo = () => {
  // 회원정보 상태 초기화(임시 데이터)
  const [userInfo, setUserInfo] = useState({
    profileImage: null, // 초기 이미지 없음
    emp_id: 'hongkil',
    emp_name: '홍길동',
    dep_id : 'DEP003',
    job_id: '개발자',
    emp_email: 'hongkildong@naver.com',
    emp_phone: '010-7777-7777',
    emp_home:'서울시 용산구',
    emp_birth: '2001-11-07'
  });

  const fileInputRef = useRef(null); // 파일 입력 요소에 접근하기 위한 ref

  // 이미지 변경 함수(파일을 선택했을 때 실행)
  const imgChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo({ ...userInfo, profileImage: reader.result });  // 이미지 상태 업데이트
      };
      reader.readAsDataURL(file); //파일을 데이터 URL로 변환
    }
  };

  // 프로필 아이콘 클릭 시 파일 선택 창 열기
  const iconClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="user-info">
      <h2>회원 정보</h2>
      <div className="profile-image-container">
        {/* 프로필 이미지가 있을 경우 이미지 렌더링, 없을 경우 기본 아이콘 */}
        {userInfo.profileImage ? (
          <img src={userInfo.profileImage} 
            alt="프로필 사진" 
            className="profile-image"
          />
        ) : (
          <div className="icon-placeholder" onClick={iconClick}>
            <IoPersonCircle size="10em" /> {/* 아이콘 크기 조정 */}
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

      {/* 사용자 정보 텍스트 */}
      <div className="userInfoText">
        ID : {userInfo.emp_id}<br/>
        이름 : {userInfo.emp_name}<br/>
        부서 ID : {userInfo.dep_id}<br/>
        직무 ID: {userInfo.job_id}<br/>
        이메일 : {userInfo.emp_email}<br/>
        전화번호 : {userInfo.emp_phone}<br/>
        주소 : {userInfo.emp_home}<br/>
        생년월일 : {userInfo.emp_birth}<br/>
      </div>
    </div>
  );
};

// 회사 공지 컴포넌트
const CompanyNotices = () => {
  const notices = [
    { no: 1, title: '신규 프로젝트 안내', date: '2024-01-01' },
    { no: 2, title: '워크샵 일정 변경', date: '2024-01-05' },
  ];

  return (
    <div className="company-notices">
      <h2>회사 공지</h2>
      <List>
        {notices.map((notice) => (
          <List.Item key={notice.no}>
            {notice.title} ({notice.date})
          </List.Item>
        ))}
      </List>
    </div>
  );
};

// 알림 컴포넌트
const Notifications = () => {
  const notifications = [
    { id: 1, message: '새로운 메시지가 도착했습니다.', time: '10:00' },
    { id: 2, message: '프로젝트 마감일이 다가옵니다.', time: '14:00' },
  ];

  return (
    <div className="notifications">
      <h2>알림</h2>
      <List>
        {notifications.map((notification) => (
          <List.Item key={notification.id}>
            {notification.message} ({notification.time})
          </List.Item>
        ))}
      </List>
    </div>
  );
};

// TodoList 컴포넌트
const TodoList = ({ date }) => {
  const list = getTodoList(date); // 선택된 날짜에 따른 할 일 목록을 가져옴

  if (!list.length) {
    return <p>해당 날짜의 일정이 없습니다.</p>;
  }

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

// TodoList를 가져오는 함수
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

export default Home;
