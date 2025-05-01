import React, { useEffect, useState } from "react";
import axiosInstance from "../../login/social/utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Button, IconButton } from "rsuite";
import { Trash } from "@rsuite/icons";
import "./notificationList.css";

function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userUuid = localStorage.getItem("user_uuid");
  const navigate = useNavigate();

  useEffect(() => {
    if (userUuid) {
      fetchNotifications();
    }
  }, [userUuid]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get(`/api/notifications/${userUuid}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("알림 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter(n => (n.empId !== 'ALL' && !n.isRead) || (n.empId === 'ALL' && !n.readByCurrentUser))
      .map(n => n.notificationId);

    await Promise.all(
      unreadIds.map(id =>
        axiosInstance.post(`/api/notifications/read/${id}/${userUuid}`)
      )
    );

    fetchNotifications();
  };

  const handleDeleteAll = async () => {
    try {
      await axiosInstance.delete(`/api/notifications/deleteAll/${userUuid}`);
      fetchNotifications();
    } catch (err) {
      console.error("전체 삭제 실패:", err);
    }
  };
  

  const handleDeleteOne = async (noti) => {
    if (noti.empId === "ALL") {
      // 공용 알림은 삭제 기록만 남김
      await axiosInstance.post(`/api/notifications/dismiss/${noti.notificationId}/${userUuid}`);
    } else {
      // 개인 알림은 실제 삭제
      await axiosInstance.delete(`/api/notifications/delete/${noti.notificationId}/${userUuid}`);
    }
    fetchNotifications();
  };
  

  const handleClick = async (noti) => {
    await axiosInstance.post(`/api/notifications/read/${noti.notificationId}/${userUuid}`);
    
    if (noti.relatedType === "notice") {
      navigate(`/erpMain?view=detail&id=${noti.relatedId}`);
    } else if (noti.relatedType === "schedule") {
      alert(`📌 일정 제목: ${noti.notificationTitle.replace('[일정] 마감 예정: ', '')}`);
    }
  };

  if (loading) return <div>⏳ 불러오는 중...</div>;

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>🔔 내 알림 목록</h3>
        <div>
          <Button size="sm" onClick={handleMarkAllRead}>모두 읽음</Button>{" "}
          <Button size="sm" color="red" onClick={handleDeleteAll}>모두 삭제</Button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <p>알림이 없습니다.</p>
      ) : (
        <ul>
          {notifications.map((noti) => (
            <li
              key={noti.notificationId}
              className={noti.isRead || noti.readByCurrentUser ? "read" : "unread"}
            >
              <div className="noti-content" onClick={() => handleClick(noti)}>
                <strong>{noti.notificationTitle}</strong>
                <br />
                <small>{new Date(noti.createdAt).toLocaleString()}</small>
              </div>
              <IconButton
                icon={<Trash />}
                onClick={() => handleDeleteOne(noti)}
                appearance="subtle"
                circle
                size="sm"
                style={{ marginLeft: "10px" }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationList;
