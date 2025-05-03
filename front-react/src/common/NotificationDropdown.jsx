import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../pages/login/social/utils/axiosInstance';
import './notificationDropdown.css';

function NotificationDropdown({ userUuid, userRole }) {
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
      const url =
        userRole === 'employee'
          ? `/api/notifications/${userUuid}` // 관리자용 알림 API
          : `/api/user-notification/${userUuid}`; // 일반회원용 알림 API

      const res = await axiosInstance.get(url);
      const data = res.data || [];
      setNotifications(data);

      // 📌 읽지 않은 알림 수 계산
      if (userRole === 'employee') {
        const personalUnread = data.filter(n => n.empId !== 'ALL' && !n.isRead).length;
        const globalUnread = data.filter(n => n.empId === 'ALL' && !n.readByCurrentUser).length;
        setUnreadCount(personalUnread + globalUnread);
      } else {
        const count = data.filter(n => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('알림 조회 실패:', err);
    }
  };

  const handleNotificationClick = async (noti) => {
    try {
      if (userRole === 'employee') {
        await axiosInstance.post(`/api/notifications/read/${noti.notificationId}/${userUuid}`);

        setNotifications(prev =>
          prev.map(n =>
            n.notificationId === noti.notificationId
              ? (n.empId === 'ALL'
                  ? { ...n, readByCurrentUser: true }
                  : { ...n, isRead: true })
              : n
          )
        );

        setUnreadCount(prev => prev - 1);

        if (noti.relatedType === 'notice') {
          navigate(`/erpMain?view=detail&id=${noti.relatedId}`);
        } else if (noti.relatedType === 'schedule') {
          alert(`📌 일정 제목: ${noti.notificationTitle.replace('[일정] 마감 예정: ', '')}`);
        } else if (noti.linkUrl) {
          navigate(noti.linkUrl);
        }
      } else {
        await axiosInstance.post(`/api/user-notification/read/${noti.userNotificationId}`);
        setNotifications(prev =>
          prev.map(n =>
            n.userNotificationId === noti.userNotificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);

        navigate(`/MypageMain?tab=notifications`);
      }
    } catch (err) {
      console.error('알림 클릭 처리 실패:', err);
    }
  };

  const isNotificationUnread = (noti) => {
    if (userRole === 'employee') {
      return noti.empId === 'ALL' ? !noti.readByCurrentUser : !noti.isRead;
    }
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
              key={userRole === 'employee' ? noti.notificationId : noti.userNotificationId}
              onClick={() => handleNotificationClick(noti)}
              style={{ fontWeight: isNotificationUnread(noti) ? 'bold' : 'normal' }}
            >
              {userRole === 'employee' ? noti.notificationTitle : noti.title}
              <br />
              <small className="text-muted">
                {new Date(noti.createdAt).toLocaleDateString()}
              </small>
            </Dropdown.Item>
          ))
        )}
        <Dropdown.Divider />
        <Dropdown.Item
          onClick={() =>
            navigate(
              userRole === 'employee'
                ? '/erpMain?view=notifications'
                : '/MypageMain?tab=notifications'
            )
          }
        >
          🔎 알림 모두 보기
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationDropdown;
