import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  List, Grid, Row, Col, Tabs, Modal, Button, Form,
  Schema, DatePicker, toaster, Message
} from 'rsuite';
import axios from 'axios';
import dayjs from 'dayjs';
import MyCalendar from './MyCalendar';
import RecentNotices from './RecentNotices';
import ErpDTO from './ErpDTO';
import ColorPalette from './ColorPalette';
import './home.css';

// 📌 Form 유효성 체크를 위한 스키마
const { StringType, DateType } = Schema.Types;

// 📌 메인 컴포넌트
const Home = ({ onNoticeClick }) => {
  // 상태 정의
  const [selectedDate, setSelectedDate] = useState(null); // 캘린더에서 선택된 날짜
  const [todoList, setTodoList] = useState([]);           // 선택된 날짜의 일정 목록
  const [calendarSchedules, setCalendarSchedules] = useState([]); // 전체 일정
  const [showModal, setShowModal] = useState(false);      // 모달 표시 여부
  const [isSubmitting, setIsSubmitting] = useState(false); // 전송 중 상태
  const [selectedSchedule, setSelectedSchedule] = useState(null); // 선택된 일정(수정용)
  const [formValue, setFormValue] = useState(defaultForm()); // 폼 데이터 상태
  const formRef = useRef(); // 폼 레퍼런스

  // ✅ Form 유효성 스키마
  const model = Schema.Model({
    title: StringType().isRequired('제목은 필수입니다'),
    start: DateType().isRequired('시작일 선택'),
    end: DateType().isRequired('종료일 선택'),
  });

  // ✅ 기본 form 객체
  function defaultForm(date = new Date()) {
    return {
      title: '',
      content: '',
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // 기본 1시간 뒤
      color: '#3498db',
    };
  }

  const empId = localStorage.getItem('user_uuid');

  // ✅ 일정 목록 불러오기
  const fetchSchedules = useCallback(async () => {
    if (!empId) return;
  
    try {
      const res = await axios.get(`http://localhost:8081/api/schedule/employee/${empId}`);
      setCalendarSchedules(res.data);
    } catch (err) {
      console.error('일정 가져오기 실패', err);
      toaster.push(<Message type="error">일정 조회 실패</Message>, { placement: 'topEnd' });
    }
  }, [empId]); // ✅ empId를 명시
  

  // 📌 컴포넌트 마운트 시 일정 불러오기
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // ✅ 날짜 클릭 시 호출되는 함수
  const handleDateSelect = (date, todos) => {
    setSelectedDate(date);
    setTodoList(todos);
  };

  // 내용 등록
  const changeContent = (e) =>{
    setFormValue({
      ...formValue,
      [e.target.name]:e.target.value,
    })
  }

  // ✅ 모달 열기 (등록 or 수정용)
  const openModal = (schedule = null) => {
    if (schedule) {
      // 수정 모드
      setSelectedSchedule(schedule);
      setFormValue({
        title: schedule.erpScheduleTitle,
        content: schedule.erpScheduleContent,
        start: new Date(schedule.erpScheduleStart),
        end: new Date(schedule.erpScheduleEnd),
        color: schedule.erpScheduleColor || '#3498db',
      });
    } else {
      // 새 일정 등록
      setSelectedSchedule(null);
      setFormValue(defaultForm(selectedDate));
    }
    setShowModal(true);
  };

  // ✅ 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
    setFormValue(defaultForm());
  };

  // ✅ 일정 등록 또는 수정
  const submitSchedule = async () => {
    if (!empId || isSubmitting) return;

    // 폼 유효성 체크
    if (!formRef.current.check()) {
      toaster.push(<Message showIcon type="warning">필수 항목을 모두 입력해주세요.</Message>, { placement: 'topCenter' });
      return;
    }

    // 날짜 유효성 체크
    if (formValue.end < formValue.start) {
      toaster.push(<Message showIcon type="warning">종료일은 시작일보다 늦어야 합니다!</Message>, { placement: 'topCenter' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedSchedule) {
        // 수정
        const updated = {
          ...selectedSchedule,
          erpScheduleTitle: formValue.title,
          erpScheduleContent: formValue.content,
          erpScheduleStart: formValue.start,
          erpScheduleEnd: formValue.end,
          erpScheduleColor: formValue.color,
        };

        await axios.put(`http://localhost:8081/api/schedule/update/${selectedSchedule.erpScheduleId}`, updated);
        updateScheduleList(updated);
        toaster.push(<Message type="success">수정 완료</Message>, { placement: 'topEnd' });

      } else {
        // 등록
        const newSchedule = {
          erpScheduleTitle: formValue.title,
          erpScheduleContent: formValue.content,
          erpScheduleStart: dayjs(formValue.start).format('YYYY-MM-DDTHH:mm:ss'), // ✅ 정확한 포맷
          erpScheduleEnd: dayjs(formValue.end).format('YYYY-MM-DDTHH:mm:ss'),
          empId,
          erpScheduleColor: formValue.color,
        };
        console.log('보내는값',newSchedule)
        const res = await axios.post('http://localhost:8081/api/schedule', newSchedule);
        setCalendarSchedules(prev => [...prev, res.data]);

        // 선택된 날짜의 일정인 경우만 todoList 업데이트
        if (selectedDate?.toDateString() === new Date(res.data.erpScheduleStart).toDateString()) {
          setTodoList(prev => [...prev, res.data]);
        }

        toaster.push(<Message type="success">등록 완료</Message>, { placement: 'topEnd' });
      }

      closeModal();
    } catch (err) {
      console.error("저장 실패", err);
      toaster.push(<Message type="error">저장 실패</Message>, { placement: 'topEnd' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 일정 수정 시 리스트 갱신
  const updateScheduleList = (updated) => {
    setCalendarSchedules(prev => prev.map(s => s.erpScheduleId === updated.erpScheduleId ? updated : s));
    setTodoList(prev => prev.map(s => s.erpScheduleId === updated.erpScheduleId ? updated : s));
  };

  // ✅ 일정 삭제
  const deleteSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      await axios.delete(`http://localhost:8081/api/schedule/delete/${selectedSchedule.erpScheduleId}`);
      setCalendarSchedules(prev => prev.filter(s => s.erpScheduleId !== selectedSchedule.erpScheduleId));
      setTodoList(prev => prev.filter(s => s.erpScheduleId !== selectedSchedule.erpScheduleId));
      toaster.push(<Message type="success">삭제 완료</Message>, { placement: 'topEnd' });
      closeModal();
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  // ✅ 컴포넌트 JSX
  return (
    <Grid fluid>
      <Row>
        {/* 좌측: 캘린더와 일정 목록 */}
        <Col xs={24} md={12}>
          <div className="calendar-todo">
            <MyCalendar onDateSelect={handleDateSelect} schedules={calendarSchedules} />
            {selectedDate && (
              <>
                <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  📅 {selectedDate.toLocaleDateString('ko-KR')}의 일정입니다.
                </p>
                <TodoList list={todoList} onItemClick={openModal} />
                <Button appearance="primary" onClick={() => openModal()} style={{ marginTop: '15px' }}>
                  일정 등록하기
                </Button>
              </>
            )}
          </div>
        </Col>

        {/* 우측: 탭 콘텐츠 */}
        <Col xs={24} md={12}>
          <div className="tabs-content">
            <Tabs defaultActiveKey="1">
              <Tabs.Tab eventKey="1" title="회원 정보"><ErpDTO /></Tabs.Tab>
              <Tabs.Tab eventKey="2" title="회사 공지"><RecentNotices onNoticeClick={onNoticeClick} /></Tabs.Tab>
              <Tabs.Tab eventKey="3" title="알림"><Notifications /></Tabs.Tab>
            </Tabs>
          </div>
        </Col>
      </Row>

      {/* 일정 등록/수정 모달 */}
      <Modal open={showModal} onClose={closeModal}>
        <Modal.Header>
          <Modal.Title>{selectedSchedule ? '일정 수정' : '일정 등록'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid ref={formRef} formValue={formValue} onChange={setFormValue} model={model}>
            <Form.Group controlId="title">
              <Form.ControlLabel>제목</Form.ControlLabel>
              <Form.Control name="title" />
            </Form.Group>
            <Form.Group controlId="content">
              <Form.ControlLabel>내용</Form.ControlLabel>
              <Form.Control name="content" onChange={changeContent} rows={3} accepter="textarea" className='scContent'/>
            </Form.Group>
            <Form.Group controlId="start">
              <Form.ControlLabel>시작일</Form.ControlLabel>
              <DatePicker format="yyyy-MM-dd HH:mm" block value={formValue.start}
                onChange={(value) => setFormValue(prev => ({ ...prev, start: value }))} />
            </Form.Group>
            <Form.Group controlId="end">
              <Form.ControlLabel>종료일</Form.ControlLabel>
              <DatePicker format="yyyy-MM-dd HH:mm" block value={formValue.end}
                onChange={(value) => setFormValue(prev => ({ ...prev, end: value }))} />
            </Form.Group>
            <Form.Group controlId="color">
              <ColorPalette
                selectedColor={formValue.color}
                onChange={(color) => setFormValue(prev => ({ ...prev, color }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="primary" onClick={submitSchedule} disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : selectedSchedule ? '수정' : '등록'}
          </Button>
          {selectedSchedule && (
            <Button appearance="ghost" onClick={deleteSchedule} color="red">
              삭제
            </Button>
          )}
          <Button onClick={closeModal} appearance="subtle">닫기</Button>
        </Modal.Footer>
      </Modal>
    </Grid>
  );
};

export default Home;

// ✅ 일정 목록 컴포넌트
const TodoList = ({ list, onItemClick }) => {
  if (!list.length) return <p>해당 날짜의 일정이 없습니다.</p>;

  return (
    <div className="todo-list">
      <List bordered>
        {list.map((item, i) => (
          <List.Item key={i} style={{ cursor: 'pointer' }} onClick={() => onItemClick(item)}>
            <div>{new Date(item.erpScheduleStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div>{item.erpScheduleTitle}</div>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

// ✅ 알림 탭 컴포넌트
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
          <List.Item key={id}>{message} ({time})</List.Item>
        ))}
      </List>
    </div>
  );
};