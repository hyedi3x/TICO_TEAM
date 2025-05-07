import React, { useEffect, useState } from "react";
import { Avatar, Button, ButtonToolbar, Panel, Placeholder, Progress, Tag } from "rsuite";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../pages/login/social/utils/axiosInstance";
import "rsuite/dist/rsuite.min.css";
import "./userHome.css";

const UserHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // 사용자 정보
    axiosInstance.get("/auth/user")
      .then(res => {
        const { name, email, nickname, phone } = res.data;
        setUser({ name, email, nickname, phone });
      })
      .catch(() => setUser(null));

    // 프로젝트 3개
    const userUuid = localStorage.getItem("user_uuid");
    if (userUuid) {
      axiosInstance.get(`/api/project/userProjects/${userUuid}`)
        .then(res => setProjects(res.data.slice(0, 3)))
        .catch(() => setProjects([]));

      // 이용권 정보
      axiosInstance.get(`/api/purchase/${userUuid}`)
        .then(res => setSubscription(res.data))
        .catch(() => setSubscription(null));
    }
  }, []);

  const resolveThumbnailUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300x200?text=No+Image";
    return url.startsWith("https") ? url : `https://tico.kro.kr${url}`;
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });

  if (!user) return <Placeholder.Paragraph rows={6} />;

  const percent = subscription
    ? Math.round((subscription.remainingDays / ((new Date(subscription.endDate) - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24))) * 100)
    : 0;

  return (
    <div className="mypage-portfolio-container">
      <div className="mypage-banner-wrapper">
        <img
          src={`${process.env.PUBLIC_URL}/my.png`}
          alt="마이페이지 배너"
          className="mypage-banner-img"
        />
        <div className="mypage-banner-text">마이페이지 홈</div>
      </div>

      <div className="grid-layout">
        {/* 👤 사용자 정보 */}
        <div className="left-column">
          <Panel shaded bordered className="profile-box">
            <div className="profile-content">
              <div className="profile-left">
                <Avatar
                  circle
                  size="lg"
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="기본 프로필 이미지"
                />
                <h4>{user.nickname}님 환영합니다!</h4>
              </div>

              <div className="profile-right">
                <p>이름 : {user.name}</p>
                <p>이메일 : {user.email}</p>
                <p>전화번호 : {user.phone}</p>
              </div>
            </div>
          </Panel>


          {/* 🎫 이용권 현황 */}
          <Panel shaded bordered className="subscription-progress">
            <h4>이용권 상태</h4>
            {subscription ? (
              <>
                <div className="circle-wrapper">
                  <Progress.Circle
                    percent={percent}
                    status="active"
                    strokeColor="#6AB0E3"
                    strokeWidth={10}
                    style={{ width: "120px" }} // ✅ 크기 제한
                  />
                </div>
                <p style={{ marginTop: "12px", fontWeight: "bold" }}>
                  {subscription.subscriptionType} / 만료일 {formatDate(subscription.endDate)}
                </p>
                <Tag color="green">{subscription.remainingDays}일 남음</Tag>
              </>
            ) : (
              <>
                <p style={{ marginTop: "12px" }}>이용 중인 이용권이 없습니다.</p>
                <Button appearance="primary" onClick={() => navigate("/MypageMain?tab=2-1")}>
                  👉 이용권 구매
                </Button>
              </>
            )}
          </Panel>
        </div>

        {/* ⚡ 오른쪽: 빠른 실행 + 최근 작품 */}
        <div className="right-column">
          <Panel shaded bordered className="quick-actions">
            <h4>빠른 실행</h4>
            <ButtonToolbar>
              <Button appearance="primary" onClick={() => navigate("/createBlock")}>
                내 프로젝트 만들기
              </Button>
            </ButtonToolbar>
          </Panel>

          <Panel shaded bordered className="tico-pj">
            <h4>최근 만든 내 작품</h4>
            {projects.length === 0 ? (
              <Placeholder.Paragraph rows={3} />
            ) : (
              <div className="tico-pj-card-grid">
                {projects.map((p) => (
                  <div
                    key={p.projectId}
                    className="tico-pj-card"
                    onClick={() => navigate(`/share/detail/${p.projectId}`)}
                  >
                    <img
                      src={resolveThumbnailUrl(p.thumbnailUrl)}
                      alt={p.title}
                      className="tico-project-thumbnail"
                    />
                    <div className="tico-pj-info">
                      <p className="tico-pj-title">{p.title}</p>
                      <p className="tico-pj-date">{p.createdAt?.slice(0, 10)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default UserHome;