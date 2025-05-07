import React, { useEffect, useState } from "react";
import { Panel, Divider, Message, Button } from "rsuite";
import axiosInstance from "../../login/social/utils/axiosInstance";
import "./userDetail.css";

const UserDetail = ({ uuid, onBack, onEdit }) => {
  // 사용자 정보 상태
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 컴포넌트 마운트 시 사용자 정보 로딩
  useEffect(() => {
    if (!uuid) return;

    axiosInstance
      .get(`/api/users/${uuid}`)
      .then((res) => {
        setUser(res.data);
        setErrorMsg("");
      })
      .catch(() => {
        setErrorMsg("사용자 정보를 불러오는 데 실패했습니다.");
      });
  }, [uuid]);

  // 에러 메시지 출력
  if (errorMsg) {
    return (
      <Message type="error" showIcon>
        {errorMsg}
      </Message>
    );
  }

  // 로딩 중
  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="user-detail-wrapper">
      {/* 사용자 기본 정보 */}
      <Panel
        bordered
        header={`${user.name} 님의 상세 정보`}
        className="user-detail-panel"
      >
        <table className="user-info-table">
          <tbody>
            <tr>
              <th>이름</th>
              <td>{user.name}</td>
            </tr>
            <tr>
              <th>이메일</th>
              <td>{user.email}</td>
            </tr>
            <tr>
              <th>닉네임</th>
              <td>{user.nickname}</td>
            </tr>
            <tr>
              <th>전화번호</th>
              <td>{user.phone}</td>
            </tr>
            <tr>
              <th>가입 방식</th>
              <td>{user.provider}</td>
            </tr>
          </tbody>
        </table>

        {/* 사용자 통계 요약 (정적 예시) */}
        <Divider>📊 사용자 통계</Divider>
        <div className="user-stats">
          <div className="stat-box">
            작품 수: <span>{user.projectCount ?? 0}</span>
          </div>
          <div className="stat-box">
            퀴즈 완료: <span>{user.quizCount ?? 0}</span>
          </div>
          <div className="stat-box">
            커뮤니티 활동 수 <br/>(댓글+좋아요+북마크 합계): <span>{user.communityActivity ?? 0}</span>
          </div>
          <div className="stat-box">
            이용권 상태: <span>{user.active ? "✅ 활성화" : "❌ 비활성"}</span>
          </div>
          <div className="stat-box">
            이용권 유형: <span>{user.subscriptionType ?? "basic"}</span>
          </div>
        </div>

        {/* 버튼 영역 - 뒤로가기, 수정 */}
        <div className="back-button">
          <Button onClick={onBack} appearance="subtle">
            ← 목록으로 돌아가기
          </Button>
          <Button
            onClick={() => onEdit(user.userUuid)}
            appearance="primary"
            style={{ marginLeft: 10 }}
          >
            ✏️ 회원 정보 수정
          </Button>
        </div>
      </Panel>
    </div>
  );
};

export default UserDetail;
