import React, { useEffect, useState } from "react";
import { Content, Footer, Header, Nav, Sidenav } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import "./erpMain.css";

// 아이콘 불러오기
import Icon from "@rsuite/icons/esm/Icon";
import { FaHome } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaPeopleRobbery } from "react-icons/fa6";
import { MdPayments } from "react-icons/md";
import { ImStatsDots } from "react-icons/im";
import { MdOutlineEmojiPeople } from "react-icons/md";
import { TbPlayCardStarFilled } from "react-icons/tb";
import { FaGear } from "react-icons/fa6";

// 각 화면 컴포넌트 불러오기
import Home from "./Home";
import ErpNotices from "./ErpNotices";
import AdminRegister from "./HR_Team/AdminRegister";
import AdminInfo from "./HR_Team/AdminInfo";
import ErpNotiCreated from "./ErpNotiCreated";
import ErpNotiDetail from "./ErpNotiDetail";
import ErpNotiUpdate from "./ErpNotiUpdate";
import FAQPut from "../../faq/FAQPut";
import axios from "axios";

function ErpMain() {
  const [expanded, setExpanded] = useState(true); // 사이드바 확장 여부
  const [activeKey, setActiveKey] = useState("1"); // 현재 선택된 메뉴의 eventKey를 저장
  const [viewMode, setViewMode] = useState("home"); // 기본은 홈 화면(Home.jsx)
  const [comNotiId, setComNotiId] = useState(null); // 상세/수정 대상 ID
  const [empInfo, setEmpInfo] = useState(null); // 로그인된 사원 정보 상태(초기값 null)

  // 컴포넌트 마운트 시(처음 렌더링 시) 사원 정보를 서버에서 불러오는 useEffect
  useEffect(() => {
    const empId = localStorage.getItem("user_uuid");
    if (empId) {
      axios
        .get(`http://localhost:8081/api/user/depId/${empId}`)
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

    switch (eventKey) {
      case "1": setViewMode("home"); break;
      case "1-1": setViewMode("list"); break;
      case "1-2": setViewMode("create"); break;
      case "2-1": setViewMode("mypage"); break;
      case "3-1": setViewMode("admin-register"); break;
      case "3-2": setViewMode("admin-info"); break;
      case "7-4": setViewMode("faq"); break;
      default: setViewMode("home"); break;
    }    
  };

  return (
    <div className="erp-main-container">
      <Header></Header>

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
                </Nav.Menu>

                {/* 인사팀 메뉴 (DEP001 부서만 활성화) */}
                <Nav.Menu
                  eventKey="3"
                  title="인사팀(HR)"
                  icon={<Icon as={BsFillPeopleFill} />}
                  className={empInfo.depId === "DEP001" ? "" : "disabled-menu"}
                >
                  <Nav.Item eventKey="3-1">관리자 등록</Nav.Item>
                  <Nav.Item eventKey="3-2">관리자 조회</Nav.Item>
                  <Nav.Item eventKey="3-3">관리자 삭제</Nav.Item>
                </Nav.Menu>

                {/* 고객 관리팀 메뉴 (DEP002 부서만 활성화) */}
                <Nav.Menu
                  eventKey="4"
                  title="고객 관리팀(CM)"
                  icon={<Icon as={FaPeopleRobbery} />}
                  className={empInfo.depId === "DEP002" ? "" : "disabled-menu"}
                >
                  <Nav.Item eventKey="4-1">회원 목록 조회</Nav.Item>
                  <Nav.Item eventKey="4-2">회원 정보 수정</Nav.Item>
                  <Nav.Item eventKey="4-3">회원 비밀번호 관리</Nav.Item>
                  <Nav.Item eventKey="4-4">회원 활동 관리</Nav.Item>
                </Nav.Menu>

                {/* 결제 관리팀 메뉴 (DEP003 부서만 활성화) */}
                <Nav.Menu
                  eventKey="5"
                  title="결제 관리팀(PAY)"
                  icon={<Icon as={MdPayments} />}
                  className={empInfo.depId === "DEP003" ? "" : "disabled-menu"}
                >
                  <Nav.Item eventKey="5-1">결제 상품 관리</Nav.Item>
                  <Nav.Item eventKey="5-2">결제 내역 관리</Nav.Item>
                  <Nav.Item eventKey="5-3">게임 이용 결제</Nav.Item>
                  <Nav.Item eventKey="5-4">
                    인기 작품 선정 및 포인트 지급
                  </Nav.Item>
                  <Nav.Item eventKey="5-5">오브젝트 결제</Nav.Item>
                </Nav.Menu>

                {/* 통계 분석팀 메뉴 (DEP004 부서만 활성화) */}
                <Nav.Menu
                  eventKey="6"
                  title="통계 분석팀(DA)"
                  icon={<Icon as={ImStatsDots} />}
                  className={empInfo.depId === "DEP004" ? "" : "disabled-menu"}
                >
                  <Nav.Item eventKey="6-1">결제 통계</Nav.Item>
                  <Nav.Item eventKey="6-2">회원 통계</Nav.Item>
                  <Nav.Item eventKey="6-3">콘텐츠 통계</Nav.Item>
                  <Nav.Item eventKey="6-4">보고서 생성</Nav.Item>
                </Nav.Menu>

                {/* 고객 지원팀 메뉴 (DEP005 부서만 활성화) */}
                <Nav.Menu
                  eventKey="7"
                  title="고객 지원팀(CS)"
                  icon={<Icon as={MdOutlineEmojiPeople} />}
                  className={empInfo.depId === "DEP005" ? "" : "disabled-menu"}
                >
                  <Nav.Item eventKey="7-1">결제 관련 문의 관리</Nav.Item>
                  <Nav.Item eventKey="7-2">환불/취소 문의 관리</Nav.Item>
                  <Nav.Item eventKey="7-3">공지사항 관리</Nav.Item>
                  <Nav.Item eventKey="7-4">FAQ 관리</Nav.Item>
                </Nav.Menu>

                {/* 콘텐츠 관리팀 메뉴 (DEP006 부서만 활성화) */}
                <Nav.Menu
                  eventKey="8"
                  title="콘텐츠 관리팀(MO)"
                  icon={<Icon as={TbPlayCardStarFilled} />}
                  className={empInfo.depId === "DEP006" ? "" : "disabled-menu"}
                >
                  <Nav.Item eventKey="8-1">작품 관리</Nav.Item>
                  <Nav.Item eventKey="8-2">커뮤니티 관리</Nav.Item>
                  <Nav.Item eventKey="8-3">스터디 관리</Nav.Item>
                </Nav.Menu>

                {/* 시스템 관리팀 메뉴 (DEP007 부서만 활성화) */}
                <Nav.Menu
                  eventKey="9"
                  title="시스템 관리팀(SYSO)"
                  icon={<Icon as={FaGear} />}
                  className={empInfo.depId === "DEP007" ? "" : "disabled-menu"}
                >
                  <Nav.Item eventKey="9-1">권한 관리</Nav.Item>
                  <Nav.Item eventKey="9-2">보안 관리</Nav.Item>
                  <Nav.Item eventKey="9-3">알림 관리</Nav.Item>
                  <Nav.Item eventKey="9-4">로그 관리</Nav.Item>
                  <Nav.Item eventKey="9-5">백업 및 복구 관리</Nav.Item>
                </Nav.Menu>
              </Nav>
            </Sidenav.Body>
          </Sidenav>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <Content
          className={`main-content ${expanded ? "expanded" : "collapsed"}`}
        >
          <div className="main-content-inner">
            {/* ERP 첫 화면 */}
            {viewMode === "home" && (
              <Home
                onNoticeClick={(id) => {
                  setComNotiId(id);
                  setViewMode("detail");
                }}
              />
            )}
            {/* 공지사항 목록 페이지 */}
            {viewMode === "list" && (
              <ErpNotices onViewDetail={(id) => {
                  setComNotiId(id);
                  setViewMode("detail");
                }}
                onEdit={(id) => {
                  setComNotiId(id);
                  setViewMode("edit");
                }}
              />
            )}
            {/* 새 공지사항 등록 */}
            {viewMode === "create" && (
              <ErpNotiCreated onRegisterSuccess={() => setViewMode("list")} />
            )}
            {/* 기업 공지사항 상세보기 */}
            {viewMode === "detail" && comNotiId && (
              <ErpNotiDetail id={comNotiId} onBack={() => setViewMode("list")} onEdit={() => setViewMode("edit")}/>
            )}

            {/* 공지사항 수정 */}
            {viewMode === "edit" && (
              <ErpNotiUpdate id={comNotiId} onBack={() => setViewMode("list")}/>
            )}

            {/* 관리자 등록 */}
            {viewMode === "admin-register" && <AdminRegister />}

            {/* 관리자 조회 */}
            {viewMode === "admin-info" && <AdminInfo />}

            {/* FAQ 관리 */}
            {viewMode === "faq" && <FAQPut />}
          </div>
        </Content>
      </div>

      <Footer></Footer>
    </div>
  );
}

export default ErpMain;
