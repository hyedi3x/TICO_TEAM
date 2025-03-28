import React, { useState } from "react";
import { Content, Footer, Header, Nav, Sidenav } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './erpMain.css'

import Icon from "@rsuite/icons/esm/Icon";
import { FaHome } from "react-icons/fa";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaPeopleRobbery } from "react-icons/fa6";
import { MdPayments } from "react-icons/md";
import { ImStatsDots } from "react-icons/im";
import { MdOutlineEmojiPeople } from "react-icons/md";
import { TbPlayCardStarFilled } from "react-icons/tb";
import { FaGear } from "react-icons/fa6";

import Home from "./Home";
import Admin from "./Admin";


function ErpMain() {

  const [expanded, setExpanded] = React.useState(true);   // 사이드바 확장 상태 관리
  const [activeKey, setActiveKey] = React.useState('1');  // 활성화된 메뉴 항목 관리
  const [content, setContent] = useState(<Home />); // 초기 콘텐츠 설정

  const handleNavSelect = (eventKey) => {
    setActiveKey(eventKey);
    switch (eventKey) {
      case '1':
        setContent(<Home />);
        break;
      case '2-1':
        setContent(<Admin />);
        break;
      // ... 다른 메뉴 항목에 대한 콘텐츠 설정 ...
      default:
        setContent(null); // 기본적으로 null 설정
        break;
    }
  };


  return (
    // 전체 페이지 컨테이너
    <div className="erp-main-container">
      <Header></Header>

      {/* 사이드바와 콘텐츠 영역 감싸는 컨테이너 */}
      <div className="content-wrapper">
        
        {/* 사이드바 */}
        <div className="sideBar">
        <Sidenav expanded={expanded} defaultOpenKeys={['3']}>
          <Sidenav.Body>
            <Nav activeKey={activeKey} onSelect={handleNavSelect}>
              <Nav.Item eventKey="1" icon={<Icon as={FaHome}/>}>
                Home
              </Nav.Item>
              <Nav.Menu placement="rightStart" eventKey="2" title="인사팀(HR)" icon={<Icon as={BsFillPeopleFill}/>}>
                <Nav.Item eventKey="2-1">관리자 조회</Nav.Item>
              </Nav.Menu>

              <Nav.Menu placement="rightStart" eventKey="3" title="고객 관리팀(CM)" icon={<Icon as={FaPeopleRobbery}/>}>
                <Nav.Item eventKey="3-1">회원 목록 조회</Nav.Item>
                <Nav.Item eventKey="3-2">회원 정보 수정</Nav.Item>
                <Nav.Item eventKey="3-3">회원 비밀번호 관리</Nav.Item>
                <Nav.Item eventKey="3-4">회원 활동 관리</Nav.Item>
              </Nav.Menu>

              <Nav.Menu placement="rightStart" eventKey="4" title="결제 관리팀(PAY)" icon={<Icon as={MdPayments}/>}>
                <Nav.Item eventKey="4-1">결제 상품 관리</Nav.Item>
                <Nav.Item eventKey="4-2">결제 내역 관리</Nav.Item>
                <Nav.Item eventKey="4-3">게임 이용 결제</Nav.Item>
                <Nav.Item eventKey="4-4">인기 작품 선정 및 포인트 지급</Nav.Item>
                <Nav.Item eventKey="4-5">오브젝트 결제</Nav.Item>
              </Nav.Menu>

              <Nav.Menu placement="rightStart" eventKey="5" title="통계 분석팀(DA)" icon={<Icon as={ImStatsDots}/>}>
                <Nav.Item eventKey="5-1">결제 통계</Nav.Item>
                <Nav.Item eventKey="5-2">회원 통계</Nav.Item>
                <Nav.Item eventKey="5-3">콘텐츠 통계</Nav.Item>
                <Nav.Item eventKey="5-4">보고서 생성</Nav.Item>
              </Nav.Menu>

              <Nav.Menu placement="rightStart" eventKey="6" title="고객 지원팀(CS)" icon={<Icon as={MdOutlineEmojiPeople}/>}>
                <Nav.Item eventKey="6-1">결제 관련 문의 관리</Nav.Item>
                <Nav.Item eventKey="6-2">환불/취소 문의 관리</Nav.Item>
                <Nav.Item eventKey="6-3">공지사항 관리</Nav.Item>
              </Nav.Menu>

              <Nav.Menu placement="rightStart" eventKey="7" title="콘텐츠 관리팀(MO)" icon={<Icon as={TbPlayCardStarFilled}/>}>
                <Nav.Item eventKey="7-1">작품 관리</Nav.Item>
                <Nav.Item eventKey="7-2">커뮤니티 관리</Nav.Item>
                <Nav.Item eventKey="7-3">스터디 관리</Nav.Item>
              </Nav.Menu>

              <Nav.Menu placement="rightStart" eventKey="8" title="시스템 관리팀(SYSO)" icon={<Icon as={FaGear}/>}>
                <Nav.Item eventKey="8-1">권한 관리</Nav.Item>
                <Nav.Item eventKey="8-2">보안 관리</Nav.Item>
                <Nav.Item eventKey="8-3">알림 관리</Nav.Item>
                <Nav.Item eventKey="8-4">로그 관리</Nav.Item>
                <Nav.Item eventKey="8-5">백업 및 복구 관리</Nav.Item>
              </Nav.Menu>
            </Nav>
          </Sidenav.Body>
          {/* 사이드 바 토글 */}
          <Sidenav.Toggle onToggle={expanded => setExpanded(expanded)} />
        </Sidenav>
      </div>

      {/* 콘텐츠 영역 */}
      <Content className={`main-content ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className='main-content-inner'>
          {content} {/* 콘텐츠 동적 렌더링 */}
        </div>
      </Content>
      </div>

      <Footer></Footer>
    </div>
  );
}

export default ErpMain;