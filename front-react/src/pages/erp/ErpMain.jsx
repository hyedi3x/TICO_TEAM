import React, { useState } from "react";
import { Content, Footer, Header, Nav, Sidenav } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './erpMain.css';

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
import FAQPut from '../../faq/FAQPut';

function ErpMain() {
  const [expanded, setExpanded] = useState(true);     // 사이드바 확장 여부
  const [activeKey, setActiveKey] = useState('1');    // 현재 선택된 메뉴의 eventKey를 저장
  const [viewMode, setViewMode] = useState('home');   // 기본은 홈 화면(Home.jsx)
  const [comNotiId, setComNotiId] = useState(null);   // 상세/수정 대상 ID

  // 메뉴 선택 시 호출되는 함수
  // viewMode를 바꿔서 콘텐츠 영역의 컴포넌트를 전환
  const handleNavSelect = (eventKey) => {
    setActiveKey(eventKey);

    switch (eventKey) {
      case '1': setViewMode('home'); break;
      case '1-1': setViewMode('list'); break;
      case '1-2': setViewMode('create'); break;
      case '2-1': setViewMode('admin-register'); break;
      case '2-2': setViewMode('admin-info'); break;
      case '6-4': setViewMode('faq'); break;
      default: setViewMode('home'); break;
    }
  };

  return (
    <div className="erp-main-container">
      <Header></Header>

      {/* 좌측 사이드바 + 우측 메인 콘텐츠 */}
      <div className="content-wrapper">

        {/* 사이드바 영역 */}
        <div className="sideBar">
          <Sidenav expanded={expanded} defaultOpenKeys={['1', '2']}>
            <Sidenav.Body>
              <Nav activeKey={activeKey} onSelect={handleNavSelect}>
                <Nav.Menu eventKey="1" title="Home" icon={<Icon as={FaHome} />}>
                  <Nav.Item eventKey="1-1">공지사항 목록</Nav.Item>
                  <Nav.Item eventKey="1-2">공지사항 등록</Nav.Item>
                </Nav.Menu>

                <Nav.Menu eventKey="2" title="인사팀(HR)" icon={<Icon as={BsFillPeopleFill} />}>
                  <Nav.Item eventKey="2-1">관리자 등록</Nav.Item>
                  <Nav.Item eventKey="2-2">관리자 조회</Nav.Item>
                </Nav.Menu>

                <Nav.Menu eventKey="3" title="고객 관리팀(CM)" icon={<Icon as={FaPeopleRobbery} />}>
                  <Nav.Item eventKey="3-1">회원 목록 조회</Nav.Item>
                  <Nav.Item eventKey="3-2">회원 정보 수정</Nav.Item>
                  <Nav.Item eventKey="3-3">회원 비밀번호 관리</Nav.Item>
                  <Nav.Item eventKey="3-4">회원 활동 관리</Nav.Item>
                </Nav.Menu>

                <Nav.Menu eventKey="4" title="결제 관리팀(PAY)" icon={<Icon as={MdPayments} />}>
                  <Nav.Item eventKey="4-1">결제 상품 관리</Nav.Item>
                  <Nav.Item eventKey="4-2">결제 내역 관리</Nav.Item>
                  <Nav.Item eventKey="4-3">게임 이용 결제</Nav.Item>
                  <Nav.Item eventKey="4-4">인기 작품 선정 및 포인트 지급</Nav.Item>
                  <Nav.Item eventKey="4-5">오브젝트 결제</Nav.Item>
                </Nav.Menu>

                <Nav.Menu eventKey="5" title="통계 분석팀(DA)" icon={<Icon as={ImStatsDots} />}>
                  <Nav.Item eventKey="5-1">결제 통계</Nav.Item>
                  <Nav.Item eventKey="5-2">회원 통계</Nav.Item>
                  <Nav.Item eventKey="5-3">콘텐츠 통계</Nav.Item>
                  <Nav.Item eventKey="5-4">보고서 생성</Nav.Item>
                </Nav.Menu>

                <Nav.Menu eventKey="6" title="고객 지원팀(CS)" icon={<Icon as={MdOutlineEmojiPeople} />}>
                  <Nav.Item eventKey="6-1">결제 관련 문의 관리</Nav.Item>
                  <Nav.Item eventKey="6-2">환불/취소 문의 관리</Nav.Item>
                  <Nav.Item eventKey="6-3">공지사항 관리</Nav.Item>
                  <Nav.Item eventKey="6-4">FAQ 관리</Nav.Item>
                </Nav.Menu>

                <Nav.Menu eventKey="7" title="콘텐츠 관리팀(MO)" icon={<Icon as={TbPlayCardStarFilled} />}>
                  <Nav.Item eventKey="7-1">작품 관리</Nav.Item>
                  <Nav.Item eventKey="7-2">커뮤니티 관리</Nav.Item>
                  <Nav.Item eventKey="7-3">스터디 관리</Nav.Item>
                </Nav.Menu>

                <Nav.Menu eventKey="8" title="시스템 관리팀(SYSO)" icon={<Icon as={FaGear} />}>
                  <Nav.Item eventKey="8-1">권한 관리</Nav.Item>
                  <Nav.Item eventKey="8-2">보안 관리</Nav.Item>
                  <Nav.Item eventKey="8-3">알림 관리</Nav.Item>
                  <Nav.Item eventKey="8-4">로그 관리</Nav.Item>
                  <Nav.Item eventKey="8-5">백업 및 복구 관리</Nav.Item>
                </Nav.Menu>
              </Nav>
            </Sidenav.Body>
            <Sidenav.Toggle onToggle={setExpanded} />
          </Sidenav>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <Content className={`main-content ${expanded ? 'expanded' : 'collapsed'}`}>
          <div className='main-content-inner'>

          {/* ERP 첫 화면 */}                {/* {...} : jsx 표현식 밑에서는 if조건문처럼 씀/ viewMode === 'detail' : 일반 js조건비교(true, false반환) / 조건 && 보여줄내용 : 조건부 렌더링(AND 연산자) */} 
          {viewMode === 'home' && (         // 공지사항 클릭 시 detail 뷰로 전환
              <Home                     
                onNoticeClick={(id) => {    // Home 컴포넌트 내부에서 최근 공지사항 클릭. 트리거
                  setComNotiId(id);         // 상세 페이지에서 볼 공지사항 ID 저장
                  setViewMode('detail');    // 화면을 상세 뷰로 전환
                }}
              />
            )}
            {/* 기업 공지사항 목록 페이지 */}
            {viewMode === 'list' && (
              <ErpNotices
                onViewDetail={(id) => {
                  setComNotiId(id);
                  setViewMode('detail');
                }}
                onEdit={(id) => {
                  setComNotiId(id);
                  setViewMode('edit');
                }}
              />
            )}
            {/* 새 공지사항 등록 완료 시 목록으로 자동 전환 */}
            {viewMode === 'create' && (
              <ErpNotiCreated onRegisterSuccess={() => setViewMode('list')} />
            )}
            {/* 기업 공지사항 상세보기 : id 기반으로 데이터 조회 */}
            {viewMode === 'detail' && comNotiId && (
              <ErpNotiDetail
                id={comNotiId}
                onBack={() => setViewMode('list')}  // 클릭 시 실행할 콜백 함수
                onEdit={() => setViewMode('edit')}
              />
            )}
            {/* 기업 공지사항 수정 */}
            {viewMode === 'edit' && (
              <ErpNotiUpdate
                id={comNotiId}
                onBack={() => setViewMode('list')} // 저장/취소 모두 목록으로
              />
            )}

            {/* 관리자 등록 */}
            {viewMode === 'admin-register' && <AdminRegister />}

            {/* 관리자 조회 */}
            {viewMode === 'admin-info' && <AdminInfo />}

            {/* FAQ 관리 */}
            {viewMode === 'faq' && <FAQPut />}
          </div>
        </Content>
      </div>

      <Footer></Footer>
    </div>
  );
}

export default ErpMain;
