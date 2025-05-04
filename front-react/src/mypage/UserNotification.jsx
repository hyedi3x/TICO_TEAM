import React, { useEffect, useState } from "react";
import axiosInstance from "../pages/login/social/utils/axiosInstance";
import { Button, IconButton, Modal } from "rsuite";
import { Trash } from "@rsuite/icons";
import "./userNotification.css";

function UserNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userUuid = localStorage.getItem("user_uuid");

  useEffect(() => {
    if (userUuid) fetchNotifications();
  }, [userUuid]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get(`/api/user-notification/${userUuid}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("알림 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.userNotificationId);

    await Promise.all(
      unreadIds.map(id =>
        axiosInstance.post(`/api/user-notification/read/${id}`)
      )
    );

    fetchNotifications();
  };

  const handleDeleteAll = async () => {
    try {
      await axiosInstance.delete(`/api/user-notification/all/${userUuid}`);
      fetchNotifications();
    } catch (err) {
      console.error("전체 삭제 실패:", err);
    }
  };

  const handleDeleteOne = async (noti) => {
    try {
      await axiosInstance.delete(`/api/user-notification/${noti.userNotificationId}`);
      fetchNotifications();
    } catch (err) {
      console.error("알림 삭제 실패:", err);
    }
  };

  const handleClick = async (noti) => {
    try {
      await axiosInstance.post(`/api/user-notification/read/${noti.userNotificationId}`);
      setSelectedNoti(noti);
      setShowModal(true);
      fetchNotifications();
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  };

  if (loading) return <div>⏳ 불러오는 중...</div>;

  return (
    <div className="userNotification-list">
      <div className="userNotification-header">
        <h3>🔔 내 알림 목록</h3>
        <div>
          <Button size="sm" onClick={handleMarkAllRead}>모두 읽음</Button>{" "}
          <Button size="sm" color="red" onClick={handleDeleteAll}>모두 삭제</Button>
        </div>
      </div>

      {/* 상세 알림 모달 */}
      <Modal open={showModal} onClose={() => setShowModal(false)} size="sm">
        <Modal.Header>
          <Modal.Title>{selectedNoti?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="userNotification-modal-title">
            {selectedNoti?.content?.split('\n')[0]}
          </div>

          {selectedNoti?.content?.split('\n')[1] && (
            <div className="userNotification-reason-box">
              <span style={{ fontWeight: 500 }}>💬 신고 사유:</span><br />
              {selectedNoti.content.split('\n')[1]}
            </div>
          )}

          {selectedNoti?.projectId && (
            <div className="userNotification-subinfo">
              🎨 <strong>신고된 작품 ID:</strong> {selectedNoti.projectId}
            </div>
          )}

          <hr />

          <div className="userNotification-createdAt">
            📅 {new Date(selectedNoti?.createdAt).toLocaleString()}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowModal(false)} appearance="primary">닫기</Button>
        </Modal.Footer>
      </Modal>

      {notifications.length === 0 ? (
        <p>알림이 없습니다.</p>
      ) : (
        <ul>
          {notifications.map((noti) => (
            <li
              key={noti.userNotificationId}
              className={`userNotification-item ${noti.isRead ? "read" : "unread"}`}
            >
              <div className="userNotification-noti-content" onClick={() => handleClick(noti)}>
                <strong>{noti.title}</strong>
                <br />
                <small>{new Date(noti.createdAt).toLocaleString()}</small>
              </div>
              <IconButton
                icon={<Trash />}
                onClick={() => handleDeleteOne(noti)}
                appearance="subtle"
                circle
                size="sm"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserNotification;
