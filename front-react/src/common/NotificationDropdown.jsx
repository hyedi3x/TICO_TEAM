import React, { useEffect, useState } from 'react';
import { Whisper, Popover, Dropdown, Badge } from 'rsuite';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../pages/login/social/utils/axiosInstance';
import './notificationDropdown.css';

// 🔔 알림 드롭다운 컴포넌트
function NotificationDropdown({ userUuid, userRole }) {
  const [notifications, setNotifications] = useState([]);      // 전체 알림 목록
  const [unreadCount, setUnreadCount] = useState(0);           // 읽지 않은 알림 수
  const navigate = useNavigate();                              // 페이지 이동용 훅

  // 유저 UUID 변경 시 알림 불러오기
  useEffect(() => {
    if (userUuid) {
      fetchNotifications();
    }
  }, [userUuid]);

  // 알림 불러오기
  const fetchNotifications = async () => {
    try {
      const url =
        userRole === 'employee'
          ? `/api/notifications/${userUuid}`         // 관리자용 API
          : `/api/user-notification/${userUuid}`;    // 일반 유저용 API

      const res = await axiosInstance.get(url);
      const data = res.data || [];
      setNotifications(data);

      // 🔢 읽지 않은 알림 수 계산
      if (userRole === 'employee') {
        const personalUnread = data.filter(n => n.empId !== 'ALL' && !n.isRead).length;
        const globalUnread = data.filter(n => n.empId === 'ALL' && !n.readByCurrentUser).length;
        setUnreadCount(personalUnread + globalUnread);
      } else {
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('알림 조회 실패:', err);
    }
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (noti) => {
    try {
      if (userRole === 'employee') {
        // 관리자 알림 읽음 처리 API 호출
        await axiosInstance.post(`/api/notifications/read/${noti.notificationId}/${userUuid}`);

        // 읽음 처리 후 로컬 상태 업데이트
        setNotifications(prev =>
          prev.map(n =>
            n.notificationId === noti.notificationId
              ? (n.empId === 'ALL'
                  ? { ...n, readByCurrentUser: true }
                  : { ...n, isRead: true })
              : n
          )
        );
        setUnreadCount(prev => prev - 1);  // 안 읽은 수 감소

        // 관련 링크로 이동
        if (noti.relatedType === 'notice') {
          navigate(`/erpMain?view=detail&id=${noti.relatedId}`);
        } else if (noti.relatedType === 'schedule') {
          alert(`📌 일정 제목: ${noti.notificationTitle.replace('[일정] 마감 예정: ', '')}`);
        } else if (noti.linkUrl) {
          navigate(noti.linkUrl);
        }
      } else {
        // 일반 사용자 알림 읽음 처리
        await axiosInstance.post(`/api/user-notification/read/${noti.userNotificationId}`);

        setNotifications(prev =>
          prev.map(n =>
            n.userNotificationId === noti.userNotificationId
              ? { ...n, isRead: true }
              : n
          )
        );
        setUnreadCount(prev => prev - 1);

        navigate(`/MypageMain?tab=notifications`);
      }
    } catch (err) {
      console.error('알림 클릭 실패:', err);
    }
  };

  // 해당 알림이 읽지 않은 상태인지 여부
  const isNotificationUnread = (noti) => {
    if (userRole === 'employee') {
      return noti.empId === 'ALL' ? !noti.readByCurrentUser : !noti.isRead;
    }
    return !noti.isRead;
  };

  //  정렬된 읽지 않은 알림 목록
  const unreadNotifications = notifications
    .filter(n => isNotificationUnread(n))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 알림 팝오버 UI
  const popover = (
    <Popover className="notification-popover">
      <div className="notification-header">
        <span>🔔 최근 알림</span>
        <button
          className="view-all-button"
          onClick={() =>
            navigate(
              userRole === 'employee'
                ? '/erpMain?view=notifications'
                : '/MypageMain?tab=notifications'
            )
          }
        >
          🔎 전체보기
        </button>
      </div>
      <div className="notification-scroll">
        {unreadNotifications.length === 0 ? (
          <div className="no-notification">알림이 없습니다.</div>
        ) : (
          unreadNotifications.map(noti => (
            <div
              key={userRole === 'employee' ? noti.notificationId : noti.userNotificationId}
              className="notification-item"
              onClick={() => handleNotificationClick(noti)}
            >
              <div className="notification-title">
                {userRole === 'employee' ? noti.notificationTitle : noti.title}
              </div>
              <div className="notification-date">
                {new Date(noti.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </Popover>
  );

  // 알림 아이콘 + 뱃지 UI
  return (
    <Whisper trigger="click" placement="bottomEnd" speaker={popover}>
      <div className="notification-button">
        <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔔</span>
        {unreadCount > 0 && <Badge content={unreadCount} className="notification-badge" />}
      </div>
    </Whisper>
  );
}

export default NotificationDropdown;
