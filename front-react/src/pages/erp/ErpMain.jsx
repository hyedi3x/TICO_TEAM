// React 및 라우팅 관련
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// UI 프레임워크 & 스타일
import { Content, Footer, Nav, Sidenav } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import "./erpMain.css";

// 아이콘
import Icon from "@rsuite/icons/esm/Icon";
import { FaCog, FaHome } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { MdOutlineEmojiPeople, MdPayments } from "react-icons/md";
import { ImStatsDots } from "react-icons/im";
import { TbPlayCardStarFilled } from "react-icons/tb";

// Home 관련 컴포넌트
import ErpNotiCreated from "./Home/ErpNotiCreated";
import ErpNotiDetail from "./Home/ErpNotiDetail";
import ErpNotiUpdate from "./Home/ErpNotiUpdate";
import ErpNotices from "./Home/ErpNotices";
import Home from "./Home/Home";

// HR_Team 관련
import AdminInfo from "./HR_Team/AdminInfo";
import AdminRegister from "./HR_Team/AdminRegister";

// MyPage 관련
import MyInfoChk from "./MyPage/MyInfoChk";
import MyInfoModify from "./MyPage/MyInfoModify";
import NotificationList from "./MyPage/NotificationList";

// CS_TEAM 관련
import ProjectReportList from "./CS_TEAM/ProjectReportList";
import UserDetail from "./CS_TEAM/UserDetail";
import UserInfoEdit from "./CS_TEAM/UserInfoEdit";
import UserList from "./CS_TEAM/UserList";

// PAY_Team 관련
import PurchaseLogPage from "./PAY_Team/PurchaseLogPage";
import SubscriptionManager from "./PAY_Team/SubscriptionManager";

// Analyze_TEAM 관련
import CsDashboard from "./Analyze_TEAM/CsDashboard";
import PayDashboard from "./Analyze_TEAM/PayDashboard";

// blockedu 관련
import BlockEduComponentPost from "../blockedu/BlockEduComponentPost";
import EMPEduList from "../blockedu/EMPEduList";

// faq 관련
import FAQPut from "../faq/FAQPut";

// notice 관련
import NoticeAdmin from "../notice/NoticeAdmin";

// 기타 컴포넌트
import ObjectSelectPage from "../../blockly/components/ObjectSelectPage";
import MainModify from "../../common/MainModify";
import ProjectManage from "../../blockly/components/ProjectManage";
import StudyManage from "../../blockly/study/StudyManage";

// 유틸리티
import axiosInstance from "../login/social/utils/axiosInstance";

function ErpMain() {
  const [expanded, setExpanded] = useState(true); // 사이드바 확장 여부
  const [activeKey, setActiveKey] = useState("1"); // 현재 선택된 메뉴의 eventKey를 저장
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("viewMode") || "home"; // 저장된 값이 없으면 "home"
  });
  const [comNotiId, setComNotiId] = useState(null); // 상세/수정 대상 ID
  const [empInfo, setEmpInfo] = useState(null); // 로그인된 사원 정보 상태(초기값 null)
  const [selectedUserId, setSelectedUserId] = useState(null); // 유저 상세 페이지용

  // URL 쿼리파라미터
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get("view");
    const idParam = params.get("id");

    if (viewParam) setViewMode(viewParam);
    if (idParam) setComNotiId(idParam);
  }, [location.search]);

  // 컴포넌트 마운트 시(처음 렌더링 시) 사원 정보를 서버에서 불러오는 useEffect
  useEffect(() => {
    const empId = localStorage.getItem("user_uuid");
    if (empId) {
      axiosInstance
        .get(`/api/user/depId/${empId}`)
        .then((response) => {
          console.log("응답 데이터 :", response.data);
          setEmpInfo(response.data);
        })
        .catch((err) => {
          console.error("관리자 정보 로딩 실패", err);
        });
    }
  }, []);

  // empInfo가 로드된 후에 isActive로 비활성화 처리하는 로직
  useEffect(() => {
    if (empInfo) {
      console.log("empInfo 로드됨:", empInfo); // 상태가 정확히 로드되었는지 확인
    }
  }, [empInfo]); // empInfo가 변경될 때마다 확인

  // empInfo가 로드되지 않았을 때 로딩 화면 표시
  if (!empInfo) {
    return <div>Loading...</div>;
  }

  // 메뉴 선택 시 호출되는 함수
  const handleNavSelect = (eventKey) => {
    setActiveKey(eventKey);
    let selected = "home";

    switch (eventKey) {
      case "1": selected = "home"; break;
      case "1-1": selected = "list"; break;
      case "1-2": selected = "create"; break;
      case "2-1": selected = "myinfoModify"; break;
      case "2-2": selected = "myinfoChk"; break;
      case "2-3": selected = "notifications"; break;
      case "3-1": selected = "admin-register"; break;
      case "3-2": selected = "admin-info"; break;
      case "4-1": selected = "subscription-manage"; break;
      case "4-2": selected = "purchaseLog"; break;
      case "5-1": selected = "payDashboard"; break;
      case "5-2": selected = "csDashboard"; break;
      case "6-1": selected = "userList"; break;
      case "6-2": selected = "projectReportList"; break;
      case "6-3": selected = "notice"; break;
      case "6-4": selected = "faq"; break;
      case "7-1": selected = "projectManage"; break;
      case "7-2": selected = "studyManage"; break;
      case "7-3": selected = "blockEduPost"; break;
      case "7-4": selected = "EMPEduList"; break;
      case "7-5": selected = "ObjectSelectPage"; break;
      case "7-6": selected = "MainModify"; break;
      default: selected = "home";      
    }
    setViewMode(selected);
    localStorage.setItem("viewMode", selected); // 선택된 화면 상태 저장
  };

  return (
    <div className="erp-main-container">
      {/* 좌측 사이드바 + 우측 메인 콘텐츠 */}
      <div className="content-wrapper">
        {/* 사이드바 영역 */}
        <div className="sideBar">
          <Sidenav expanded={expanded} defaultOpenKeys={["1", "2"]}>
            <Sidenav.Body>
              <Nav activeKey={activeKey} onSelect={handleNavSelect}>
                {/* Home 메뉴 */}
                <Nav.Menu eventKey="1" title="Home" icon={<Icon as={FaHome} />}>
                  <Nav.Item eventKey="1-1">공지사항 목록</Nav.Item>
                  <Nav.Item eventKey="1-2">공지사항 등록</Nav.Item>
                </Nav.Menu>

                {/* 마이페이지 메뉴 */}
                <Nav.Menu
                  eventKey="2"
                  title="마이페이지"
                  icon={<Icon as={BsFillPeopleFill} />}
                >
                  <Nav.Item eventKey="2-1">나의 정보 수정</Nav.Item>
                  <Nav.Item eventKey="2-2">나의 정보 조회</Nav.Item>
                  <Nav.Item eventKey="2-3">알림 목록</Nav.Item>
                </Nav.Menu>

                {/* 인사팀 메뉴 (DEP001 부서만 활성화) */}
                <Nav.Menu
                  eventKey="3"
                  title="인사팀(HR)"
                  icon={<Icon as={BsFillPeopleFill} />}
                  className={
                    empInfo.depId === "DEP001" || empInfo.depId === "DEP000"
                      ? ""
                      : "disabled-menu"
                  }
                >
                  <Nav.Item eventKey="3-1">관리자 등록</Nav.Item>
                  <Nav.Item eventKey="3-2">관리자 조회/수정/삭제</Nav.Item>
                </Nav.Menu>

                {/* 결제 관리팀 메뉴 (DEP002 부서만 활성화) */}
                <Nav.Menu
                  eventKey="4"
                  title="결제 관리팀(PAY)"
                  icon={<Icon as={MdPayments} />}
                  className={
                    empInfo.depId === "DEP002" || empInfo.depId === "DEP001"
                      ? ""
                      : "disabled-menu"
                  }
                >
                  <Nav.Item eventKey="4-1">결제 회원 관리</Nav.Item>
                  <Nav.Item eventKey="4-2">결제 내역 관리</Nav.Item>
                </Nav.Menu>

                {/* 통계 분석팀 메뉴 (DEP003 부서만 활성화) */}
                <Nav.Menu
                  eventKey="5"
                  title="통계 분석팀(DA)"
                  icon={<Icon as={ImStatsDots} />}
                  className={
                    empInfo.depId === "DEP003" || empInfo.depId === "DEP001"
                      ? ""
                      : "disabled-menu"
                  }
                >
                  <Nav.Item eventKey="5-1">회원 결제·환불·구독 현황</Nav.Item>
                  <Nav.Item eventKey="5-2">회원 참여도/학습률 분석</Nav.Item>
                  <Nav.Item eventKey="5-3">콘텐츠 통계</Nav.Item>
                </Nav.Menu>

                {/* 고객 지원팀 메뉴 (DEP004 부서만 활성화) */}
                <Nav.Menu
                  eventKey="6"
                  title="고객 지원팀(CS)"
                  icon={<Icon as={MdOutlineEmojiPeople} />}
                  className={
                    empInfo.depId === "DEP004" || empInfo.depId === "DEP001"
                      ? ""
                      : "disabled-menu"
                  }
                >
                  <Nav.Item eventKey="6-1">회원 목록 조회</Nav.Item>
                  <Nav.Item eventKey="6-2">작품 신고 목록</Nav.Item>
                  <Nav.Item eventKey="6-3">공지사항 관리</Nav.Item>
                  <Nav.Item eventKey="6-4">FAQ 관리</Nav.Item>
                </Nav.Menu>

                {/* 콘텐츠 관리팀 메뉴 (DEP005 부서만 활성화) */}
                <Nav.Menu
                  eventKey="7"
                  title="콘텐츠 관리팀(MO)"
                  icon={<Icon as={TbPlayCardStarFilled} />}
                  className={
                    empInfo.depId === "DEP005" || empInfo.depId === "DEP001"
                      ? ""
                      : "disabled-menu"
                  }
                >
                  <Nav.Item eventKey="7-1">작품 관리</Nav.Item>
                  <Nav.Item eventKey="7-2">스터디 관리</Nav.Item>
                  <Nav.Item eventKey="7-3">블럭 학습 퀴즈 등록</Nav.Item>
                  <Nav.Item eventKey="7-4">블럭 학습 퀴즈 관리 목록</Nav.Item>
                  <Nav.Item eventKey="7-5">오브젝트 관리</Nav.Item>
                  <Nav.Item eventKey="7-6">메인화면 관리</Nav.Item>
                </Nav.Menu>
              </Nav>
            </Sidenav.Body>
            <Sidenav.Toggle onToggle={(val) => setExpanded(val)} />
          </Sidenav>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <Content
          className={`main-content2 ${expanded ? "expanded" : "collapsed"}`}
        >
          <div className="main-content-inner2">
            {/* Home */}
            {viewMode === "home" && (
              <Home
                onNoticeClick={(id) => {
                  setComNotiId(id);
                  setViewMode("detail");
                }}
              />
            )}
            {viewMode === "list" && (
              <ErpNotices
                onViewDetail={(id) => {
                  setComNotiId(id);
                  setViewMode("detail");
                }}
                onEdit={(id) => {
                  setComNotiId(id);
                  setViewMode("edit");
                }}
              />
            )}
            {viewMode === "create" && (
              <ErpNotiCreated onRegisterSuccess={() => setViewMode("list")} />
            )}
            {viewMode === "detail" && comNotiId && (
              <ErpNotiDetail
                id={comNotiId}
                onBack={() => setViewMode("list")}
                onEdit={() => setViewMode("edit")}
              />
            )}
            {viewMode === "edit" && (
              <ErpNotiUpdate
                id={comNotiId}
                onBack={() => setViewMode("list")}
              />
            )}

            {/* MyPage */}
            {viewMode === "myinfoModify" && <MyInfoModify />}
            {viewMode === "myinfoChk" && <MyInfoChk />}
            {viewMode === "notifications" && <NotificationList />}

            {/* HR_Team */}
            {viewMode === "admin-register" && <AdminRegister />}
            {viewMode === "admin-info" && <AdminInfo />}

            {/* PAY_Team */}
            {viewMode === "subscription-manage" && <SubscriptionManager />}
            {viewMode === "purchaseLog" && <PurchaseLogPage />}

            {/* Analyze_TEAM */}
            {viewMode === "payDashboard" && <PayDashboard />}
            {viewMode === "csDashboard" && <CsDashboard />}

            {/* CS_TEAM */}
            {viewMode === "userList" && (
              <UserList
                onUserClick={(uuid) => {
                  setSelectedUserId(uuid);
                  setViewMode("user-detail");
                }}
              />
            )}
            {viewMode === "user-detail" && selectedUserId && (
              <UserDetail
                uuid={selectedUserId}
                onBack={() => setViewMode("userList")}
                onEdit={(uuid) => {
                  setSelectedUserId(uuid);
                  setViewMode("user-edit");
                }}
              />
            )}
            {viewMode === "user-edit" && selectedUserId && (
              <UserInfoEdit
                uuid={selectedUserId}
                onBack={() => setViewMode("user-detail")}
              />
            )}
            {viewMode === "projectReportList" && <ProjectReportList />}
            {viewMode === "notice" && <NoticeAdmin />}
            {viewMode === "faq" && <FAQPut />}

            {/* 콘텐츠 관리팀 (blockedu, 오브젝트 등) */}
            {viewMode === "projectManage" && <ProjectManage />}
            {viewMode === "blockEduPost" && <BlockEduComponentPost />}
            {viewMode === "EMPEduList" && <EMPEduList />}
            {viewMode === "ObjectSelectPage" && <ObjectSelectPage />}
            {viewMode === "MainModify" && <MainModify />}
            {viewMode === "studyManage" && <StudyManage />}
          </div>
        </Content>
      </div>

      <Footer></Footer>
    </div>
  );
}

export default ErpMain;
