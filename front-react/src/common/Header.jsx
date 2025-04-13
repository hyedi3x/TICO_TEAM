import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Dropdown, Form, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import logo from '../imgs/TICO_logo_icon.png';
import logo1 from '../imgs/TICO_logo.png';
import './Header.css';
import axiosInstance from '../pages/login/social/utils/axiosInstance';


function Header() {
  const token = localStorage.getItem('accessToken');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
    if (localStorage.getItem('accessToken')) {
      axiosInstance.get('/auth/user')
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('사용자 정보 조회 실패:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsLoggedIn(false);
          navigate('/login');
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    axiosInstance.post('/auth/logout')
      .then(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_uuid');
        localStorage.removeItem('autoLogin');
        setIsLoggedIn(false);
        setUserRole(null);
        setUser(null);
        navigate('/');
      })
      .catch((error) => {
        console.error('로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다.');
      });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className='header'>
      <Navbar expand="lg" className="bg-white mb-3 border-bottom" style={{ height: '90px', padding: '20px' }}>
        <Container fluid className='main-container'>
          <Link to="/">
            <Navbar.Brand>
              <img src={logo} alt="TICO LOGO" style={{ height: '35px' }} />
              <img src={logo1} alt="TICO LOGO" style={{ height: '45px', marginBottom: '5px' }} />
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" placement="end">
            <Offcanvas.Header closeButton style={{ borderBottom: '1px solid #e2e2e2' }}>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                <img src={logo1} alt="TICO LOGO" style={{ height: '45px', marginBottom: '5px' }} />
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <NavDropdown title="관리자ERP" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="/erpMain">관리자 ERP</NavDropdown.Item>
                </NavDropdown>

                <NavDropdown title="생각하기" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="/#action3">티코 학습시키기</NavDropdown.Item>
                  <NavDropdown.Item href="/eduList">블럭 학습하기</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="만들기" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="/createBlock">작품 만들기</NavDropdown.Item>
                  <NavDropdown.Item href="/#action5">학습 하기</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="공유하기" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="/#action3">작품 공유하기</NavDropdown.Item>
                  <NavDropdown.Item href="/#action4">스터디 공유하기</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="커뮤니티" id="offcanvasNavbarDropdown">
                  <NavDropdown.Item href="/#action3">묻고 답하기</NavDropdown.Item>
                  <NavDropdown.Item href="/#action4">노하우&팁</NavDropdown.Item>
                  <NavDropdown.Item href="/#action4">티코 이야기</NavDropdown.Item>
                  <NavDropdown.Item href="/#action4">공지사항</NavDropdown.Item>
                  <NavDropdown.Item href="/faqlist">FAQ</NavDropdown.Item>
                  <NavDropdown.Item href="/#action5">탐험하기</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Form className="d-flex">
                <Form.Control type="search" placeholder="Search" className="me-2" aria-label="Search" />
                <Button className='button' variant="outline-success">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </Button>
              </Form>
              {/* 로그인 상태에 따라 로그인/로그아웃 버튼 전환 */}
              {isLoggedIn ? (
                <>
                  {/* 드롭다운을 사용하여 클릭 시 Mypage가 보이도록 구성 */}
                  <Dropdown style={{ marginRight: '10px' }}>
                    <Dropdown.Toggle
                      variant="light"
                      id="dropdown-basic"
                      style={{ color: 'black' }}
                    >
                      { 
                        user 
                          ? (user.provider === 'employee' ? user.user_uuid : user.email) 
                          : "My Account"
                      }
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate('/MypageMain')}>
                        Mypage
                      </Dropdown.Item>
                      {/* 필요시 추가 메뉴 아이템 */}
                    </Dropdown.Menu>
                  </Dropdown>
                  
                <Button className='button2' variant="outline-danger" onClick={handleLogout}>
                  로그아웃
                </Button>
                </>
              ) : (
                <Button className='button1' variant="outline-success" onClick={handleLogin}>
                  로그인
                </Button>
              )}
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
