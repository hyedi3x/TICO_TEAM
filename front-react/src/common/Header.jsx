import React from 'react';
import { Link } from 'react-router-dom';

// 부트스트랩 컴포넌트
import { Button, Container, Form, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Font Awesome 아이콘 라이브러리 및 아이콘 불러오기
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

// 이미지 파일들
import logo from '../imgs/TICO_logo_icon.png';
import logo1 from '../imgs/TICO_logo.png';

//CSS 우선순위 : CSS 파일 간에 동일한 선택자에 대한 스타일 규칙이 있는 경우, 나중에 import된 파일의 규칙이 우선 적용된다. 여기서는 Header.css의 스타일 규칙이 bootstrap.min.css의 규칙을 덮어쓴다.
import './Header.css';

function Header() {
  return (
    <div className='header'>
      <Navbar expand="lg" className="bg-white mb-3 border-bottom" style={{height: '90px', padding:'20px'}}> 
        {/* 부트스트랩 Navbar 컴포넌트 사용. bg-white:배경색 흰색, mb-3:margint-bottom설정, border-bottom하단 테두리 추가. */}
        <Container fluid className='main-container'> 
          {/* 부트스트랩 Container 컴포넌트 네비케이션 바의 내용을 감싸고, 반응형 레이아웃 설정. */}
          <Link to="/">
            <Navbar.Brand>
              <img
                src={logo}
                alt="TICO LOGO"
                style={{ height: '35px'}}
                />

              <img
                src={logo1}
                alt="TICO LOGO"
                style={{height: '45px', marginBottom: '5px'}}
                />  
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="offcanvasNavbar"/>
          {/* 화면 너비가 lg 중단점 미만일 때 토글 버튼 생성 */}
            <Navbar.Offcanvas
              id="offcanvasNavbar"
              aria-labelledby="offcanvasNavbarLabel"
              placement="end"
            >
            {/* 사이드 메뉴 */}
            <Offcanvas.Header closeButton style={{borderBottom: '1px solid #e2e2e2'}}>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                <img
                src={logo1}
                alt="TICO LOGO"
                style={{height: '45px', marginBottom: '5px'}}
                />  
              </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                
                <NavDropdown title="생각하기" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="#action3">티코 학습하기</NavDropdown.Item>
                </NavDropdown>

                <NavDropdown title="만들기" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="#action3">작품 만들기</NavDropdown.Item>
                  <NavDropdown.Item href="#action5">스터디 만들기</NavDropdown.Item>
                </NavDropdown>

                <NavDropdown title="공유하기" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="#action3">작품 공유하기</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">스터디 공유하기</NavDropdown.Item>
                </NavDropdown>

                <NavDropdown title="커뮤니티" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="#action3">묻고 답하기</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">노하우&팁</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">티코 이야기</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">공지사항</NavDropdown.Item>
                  <NavDropdown.Item href="#action5">탐험하기</NavDropdown.Item>
                </NavDropdown>

              </Nav>

              {/* 검색 폼 */}
              <Form className="d-flex">
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                />

                {/* header.css의 .butoon 스타일 적용 */}
                <Button className='button' variant="outline-success">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </Button>
              </Form>
              
              <Link to="/login">
                <Button className='button1' variant="outline-success">
                  로그인
                </Button>
              </Link>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;