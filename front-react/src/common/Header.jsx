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
import NotificationDropdown from './NotificationDropdown';

function Header() {
  const token = localStorage.getItem('accessToken');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm('');
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      alert('검색어를 입력해 주세요.');
      return;
    }
    // 검색 결과 페이지로 이동 (예시: /search?query=검색어)
    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="header">
      <Navbar expand="xxl" className="header-navbar"> {/* 1200px 이상에서 보이도록 설정 */}
        <Container fluid className="header-container">

          {/* 로고 */}
          <Link to="/">
            <Navbar.Brand>
              <img src={logo} alt="TICO LOGO" style={{ height: '35px' }} />
              <img src={logo1} alt="TICO LOGO" style={{ height: '45px', marginBottom: '5px' }} />
            </Navbar.Brand>
          </Link>

          {/* 햄버거 버튼 */}
          <Navbar.Toggle aria-controls="offcanvasNavbar" />

          {/* 오프캔버스 메뉴 (모바일용) */}
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          >
            <Offcanvas.Header closeButton style={{ borderBottom: '1px solid #e2e2e2' }}>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                <img src={logo1} alt="TICO LOGO" style={{ height: '45px', marginBottom: '5px' }} />
              </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>

              {/* 네비게이션 메뉴 */}
              <Nav className="justify-content-end align-items-center">
                <Nav.Link href="/tutorial">티코 학습시키기</Nav.Link>
                <Nav.Link href="/eduList">블럭 학습하기</Nav.Link>
                <Nav.Link href="/createBlock">작품 만들기</Nav.Link>
                <Nav.Link href="/share">작품 공유하기</Nav.Link>
                <Nav.Link href="/noticeList">공지사항</Nav.Link>
                <Nav.Link href="/faqlist">FAQ</Nav.Link>
              </Nav>

              {/* 검색창 */}
              <div className="header-search-container">
                <Form className="d-flex" onSubmit={handleSearch}>
                  <Form.Control
                    type="search"
                    placeholder="Search"
                    className="header-search-input"
                    aria-label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button className="header-button" variant="outline-success" type="submit">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </Button>
                </Form>
              </div>
              {/* 로그인 / 로그아웃 */}
              {isLoggedIn ? (
                    <Dropdown.Item onClick={() => navigate('/MypageMain')}>Mypage</Dropdown.Item>
                <>
                   {user?.provider !== 'employee' && (
                    <Dropdown style={{ marginRight: '10px' }}>
                      <Dropdown.Toggle variant="light" style={{ color: 'black' }}>
                        {user?.email || 'My Account'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate('/MypageMain')}>
                          {user?.nickname}님의 페이지
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
              )}

                  <NotificationDropdown
                    userUuid={user?.user_uuid}
                    userRole={user?.provider}
                    onAllViewClick={() =>
                      navigate(
                        user?.provider === 'employee'
                          ? "/erpMain?view=notifications"
                          : "/MypageMain?tab=notifications"
                      )
                    }
                  />

                  <Button className="header-button2" variant="danger" onClick={handleLogout}>
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Button className="header-button1"  onClick={handleLogin}>
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