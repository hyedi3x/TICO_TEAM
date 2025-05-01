import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../pages/login/social/utils/axiosInstance';
import './notificationDropdown.css';

function NotificationDropdown({ userUuid }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (userUuid) {
      fetchNotifications();
    }
  }, [userUuid]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get(`/api/notifications/${userUuid}`);
      const data = res.data || [];
      setNotifications(data);

      const personalUnread = data.filter(n => n.empId !== 'ALL' && !n.isRead).length;
      const globalUnread = data.filter(n => n.empId === 'ALL' && !n.readByCurrentUser).length;
      setUnreadCount(personalUnread + globalUnread);
    } catch (err) {
      console.error('알림 조회 실패:', err);
    }
  };

  const handleNotificationClick = async (noti) => {
    try {
      await axiosInstance.post(`/api/notifications/read/${noti.notificationId}/${userUuid}`);
    
      // 📌 읽은 알림을 상태에서 바로 반영
      setNotifications(prev =>
        prev.map(n => {
          if (n.notificationId === noti.notificationId) {
            // 개인 알림
            if (n.empId !== 'ALL') return { ...n, isRead: true };
            // 글로벌 알림
            else return { ...n, readByCurrentUser: true };
          }
          return n;
        })
      );

      // 🔁 알림 수 재계산
      setUnreadCount(prev => prev - 1);

      // 이동 처리
      if (noti.relatedType === 'notice') {
        navigate(`/erpMain?view=detail&id=${noti.relatedId}`);
      } else if (noti.relatedType === 'schedule') {
        alert(`📌 일정 제목: ${noti.notificationTitle.replace('[일정] 마감 예정: ', '')}`);
      } else if (noti.linkUrl) {
        navigate(noti.linkUrl);
      }
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  const isNotificationUnread = (noti) => {
    if (noti.empId === 'ALL') return !noti.readByCurrentUser;
    return !noti.isRead;
  };

  return (
    <Dropdown align="end" className="notification-dropdown">
      <Dropdown.Toggle variant="light" id="notification-dropdown-toggle" style={{ position: 'relative' }}>
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown-menu">
        <Dropdown.Header>최근 알림</Dropdown.Header>
        {notifications.length === 0 ? (
          <Dropdown.ItemText className="text-muted">알림이 없습니다.</Dropdown.ItemText>
        ) : (
          notifications.slice(0, 3).map((noti) => (
            <Dropdown.Item
              key={noti.notificationId}
              onClick={() => handleNotificationClick(noti)}
              style={{ fontWeight: isNotificationUnread(noti) ? 'bold' : 'normal' }}
            >
              {noti.notificationTitle}
              <br />
              <small className="text-muted">
                {new Date(noti.createdAt).toLocaleDateString()}
              </small>
            </Dropdown.Item>
          ))
        )}
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => navigate('/erpMain?view=notifications')}>
          🔎 알림 모두 보기
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationDropdown;
