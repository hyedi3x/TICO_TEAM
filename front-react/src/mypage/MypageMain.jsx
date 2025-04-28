// MypageMain.jsx
import React, { useState } from "react";
import { Content, Footer, Header, Nav, Sidenav } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import "./mypageMain.css";

import Icon from "@rsuite/icons/esm/Icon";
import { FaHome, FaEdit, FaTrash, FaMoneyBillWave } from "react-icons/fa";

// 외부 파일에서 컴포넌트 import
import EditProfile from "./EditProfile";
import DeleteAccount from "./DeleteAccount";
import PurchasePage from "./PurchasePage";
import SubscriptionState from "./SubscriptionState";
import MyProjects from "./MyProjects";

// Home 컴포넌트는 간단한 예시로 인라인 작성 (원하는 경우 별도 파일로 분리 가능)
function MyPageHome() {
  return (
    <div className="mypage-content">
      <h2>마이페이지 홈</h2>
      <p>환영합니다! 여기는 마이페이지 홈입니다.</p>
    </div>
  );
}

function MypageMain() {
  const [expanded, setExpanded] = useState(true); // 사이드바 확장 여부
  const [activeKey, setActiveKey] = useState("1");  // 활성 메뉴 키
  const [content, setContent] = useState(<MyPageHome />); // 초기 콘텐츠
  const goToPurchase = () => setContent(<PurchasePage goToStatus={goToStatus} />);  // 
  const goToStatus = () => setContent(<SubscriptionState goToPurchase={goToPurchase} />); // 결제 완료시 실행

  const handleNavSelect = (eventKey) => {
    setActiveKey(eventKey);
    switch (eventKey) {
      case "1": setContent(<MyPageHome />); break;
      case "2": setContent(<MyPageHome />); break;
      case "2-1": setContent(<PurchasePage goToStatus={goToStatus} />);break;
      case "2-2": setContent(<SubscriptionState goToPurchase={goToPurchase} />); break;
      case "3-1": setContent(<EditProfile />); break;
      case "4-1": setContent(<DeleteAccount />); break;
      case "4-3": setContent(<MyProjects />); break;
      default: setContent(<MyPageHome />); break;
    }
  };

  return (
    <div className="mypage-main-container">
      <Header />
      <div className="content-wrapper">
        {/* 왼쪽 사이드바 */}
        <div className={`sideBar ${expanded ? "expanded" : "collapsed"}`}>
          <Sidenav expanded={expanded}>
            <Sidenav.Body>
              <Nav activeKey={activeKey} onSelect={handleNavSelect}>
                <Nav.Item eventKey="1" icon={<Icon as={FaHome} />}>
                  Home
                </Nav.Item>
                <Nav.Menu
                  placement="rightStart"
                  eventKey="2"
                  title="이용권"
                  icon={<Icon as={FaMoneyBillWave} />}
                >
                <Nav.Item eventKey="2-1">이용권 구매</Nav.Item>
                <Nav.Item eventKey="2-2">이용권 상태</Nav.Item>
                </Nav.Menu>
                <Nav.Menu
                  placement="rightStart"
                  eventKey="3"
                  title="회원정보 수정"
                  icon={<Icon as={FaEdit} />}
                >
                  <Nav.Item eventKey="3-1">회원 정보 수정</Nav.Item>
                </Nav.Menu>
                <Nav.Menu
                  placement="rightStart"
                  eventKey="4"
                  title="회원 탈퇴"
                  icon={<Icon as={FaTrash} />}
                >
                  <Nav.Item eventKey="4-1">회원 탈퇴</Nav.Item>
                </Nav.Menu>
                <Nav.Menu
                  placement="rightStart"
                  eventKey="4-3"
                  title="내 작품"
                  icon={<Icon as={FaEdit} />}
                >
                  <Nav.Item eventKey="4-3">내 작품</Nav.Item>
                </Nav.Menu>
              </Nav>
            </Sidenav.Body>
            <Sidenav.Toggle onToggle={(val) => setExpanded(val)} />
          </Sidenav>
        </div>
        {/* 오른쪽 메인 콘텐츠 영역 */}
        <Content className="main-content">
          <div className="main-content-inner">{content}</div>
        </Content>
      </div>
      <Footer />
    </div>
  );
}

export default MypageMain;
