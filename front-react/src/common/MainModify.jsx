import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
// 스타일
import './Main.css';
import '../pages/chatbot/chatbotWindow.css';
// Swiper React 컴포넌트
import { Swiper, SwiperSlide } from 'swiper/react';
// Swiper 스타일
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Swiper 모듈(자동 재생, 페이지네이션, 네비게이션)
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
// Bootstrap 컴포넌트(카드, 열, 행, 버튼, 모달)
import { Card, Col, Row, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// 이미지 파일
import img1 from '../imgs/짱구1.jpg';
// chatbot 객체 임포트
import ChatbotWindow from '../pages/chatbot/ChatbotWindow';
// erp logo 객체 임포트
import ErpLogo from '../pages/erp/ErpLogo';

function MainModify() {
  const [userRole, setUserRole] = useState(null);
  const [staffPickProjects, setStaffPickProjects] = useState([
    { id: 1, thumbnailUrl: img1, title: 'Card Title 1', introduction: 'Some quick example text...' },
    { id: 2, thumbnailUrl: img1, title: 'Card Title 2', introduction: 'Some quick example text...' },
    { id: 3, thumbnailUrl: img1, title: 'Card Title 3', introduction: 'Some quick example text...' },
    { id: 4, thumbnailUrl: img1, title: 'Card Title 4', introduction: 'Some quick example text...' },
  ]); // 초기 스태프 선정 작품 데이터 (하드코딩)
  const [popularProjects, setPopularProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [allProjects, setAllProjects] = useState([]); // 모든 작품 목록
  const [selectedStaffPickIndex, setSelectedStaffPickIndex] = useState(null);

  const resolveThumbnailUrl = (url) => {
    if (url && !url.startsWith('http')) {
      return `http://localhost:8081${url}`;
    }
    return url || img1;
  };

  useEffect(() => {
    // 인기 작품 목록을 가져오는 API 호출 (백엔드에서 구현 필요)
    fetch('/project/popular-projects') // 실제 API 엔드포인트로 변경
      .then(response => response.json())
      .then(data => {
        setPopularProjects(data);
      })
      .catch(error => {
        console.error("인기 작품 목록을 불러오는 데 실패했습니다:", error);
      });
  }, []);

  useEffect(() => {
    const userUuid = localStorage.getItem("user_uuid");
    console.log(userUuid);
    fetch('/project/staff-pick')
      .then(res => res.json())
      .then(async (data) => {
        const updatedProjects = [...staffPickProjects];
        for (let item of data) {
          const projectId = item.projectId;
          const slot = item.slotIndex;
          const res = await fetch(`/project/${projectId}`);
          const project = await res.json();
          updatedProjects[slot] = {
            id: project.projectId,
            thumbnailUrl: project.thumbnailUrl,
            title: project.title,
            introduction: project.introduction,
            userUuid : userUuid,
          };
        }
        setStaffPickProjects(updatedProjects);
      });
  }, []);

  const fetchProjectList = () => {
    fetch(`http://localhost:8081/project/projectList`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        setAllProjects(data);
      })
      .catch(error => {
        console.error("전체 작품 목록을 불러오는 데 실패했습니다:", error);
      });
  };

  // 작품 목록 모달 컴포넌트 (별도 파일로 분리하는 것이 좋습니다.)
  const ProjectListModal = ({ show, onHide, onProjectSelect }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (show) {
        setLoading(true);
        fetch('http://localhost:8081/project/projectList')
          .then(res => res.json())
          .then(data => {
            setProjects(data);
            setLoading(false);
          })
          .catch(err => {
            console.error("작품 목록 로드 실패:", err);
            setLoading(false);
          });
      }
    }, [show]);
  
    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <Modal.Title>작품 선택</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-5">로딩 중...</div>
          ) : (
            <Row>
              {projects.map((project) => (
                <Col
                  key={project.projectId}
                  xs={6}
                  md={4}
                  lg={3}
                  className="mb-4"
                  onClick={() => onProjectSelect(project)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card style={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Card.Img
                      variant="top"
                      src={resolveThumbnailUrl(project.thumbnailUrl)}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body style={{ padding: '0.5rem' }}>
                      <Card.Title className="text-truncate text-center" style={{ fontSize: '1rem' }}>
                        {project.title}
                      </Card.Title>
                      <Card.Text className="text-muted text-center" style={{ fontSize: '0.8rem' }}>
                        {project.introduction?.substring(0, 50)}
                        {project.introduction?.length > 50 && '...'}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between text-muted" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                      <div>👁 {project.viewCount || 0}</div>
                      <div>❤️ {project.likeCount || 0}</div>
                      <div>💬 {project.commentCount || 0}</div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>닫기</Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const handleOpenProjectModal = (index) => {
    setSelectedStaffPickIndex(index);
    fetchProjectList(); // 모달 열 때마다 호출
    setShowProjectModal(true);
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setSelectedStaffPickIndex(null);
  };

  const handleSelectProject = (project) => {
    if (selectedStaffPickIndex !== null) {
      const updatedStaffPickProjects = [...staffPickProjects];
      updatedStaffPickProjects[selectedStaffPickIndex] = {
        id: project.projectId,
        thumbnailUrl: project.thumbnailUrl,
        title: project.title,
        introduction: project.introduction,
      };
      setStaffPickProjects(updatedStaffPickProjects);
      handleCloseProjectModal();
    }
  };

  const handleRemoveStaffPickProject = (index) => {
    fetch(`/api/staff-pick/${index}`, {
      method: 'DELETE',
    })
      .then(() => {
        const updatedStaffPickProjects = [...staffPickProjects];
        updatedStaffPickProjects[index] = {
          id: null,
          thumbnailUrl: '',
          title: '등록해주세요',
          introduction: '',
        };
        setStaffPickProjects(updatedStaffPickProjects);
      })
      .catch(err => console.error("삭제 실패:", err));
  };

  const handleSaveStaffPicks = () => {
    const payload = staffPickProjects.map((item, idx) => ({
      slotIndex: idx,
      projectId: item.id
    }));
    fetch('/project/staff-pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (res.ok) alert("저장 완료!");
      })
      .catch(err => console.error("저장 실패:", err));
  };

  return (
    <div className='main-container'>
      {/* 스와이퍼 영역 (나중에 구현) */}
      <div className='sw'>
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          <SwiperSlide>Slide 1</SwiperSlide>
          <SwiperSlide>Slide 2</SwiperSlide>
          <SwiperSlide>Slide 3</SwiperSlide>
          <SwiperSlide>Slide 4</SwiperSlide>
          <SwiperSlide>Slide 5</SwiperSlide>
          <SwiperSlide>Slide 6</SwiperSlide>
          <SwiperSlide>Slide 7</SwiperSlide>
          <SwiperSlide>Slide 8</SwiperSlide>
          <SwiperSlide>Slide 9</SwiperSlide>
        </Swiper>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className='maincon'>
        {/* 스태프 선정 작품 섹션 */}
        <div className='bt'>
          <h1 className='h1'>스태프 선정 작품</h1> 
          <Button variant="success" onClick={handleSaveStaffPicks}>
            저장하기
          </Button>
          <p className='p'>창의적이고 완성도가 높은 작품을 스태프가 직접 뽑아 소개해요.</p>
          <Row className='oneCard'>
            {staffPickProjects.map((project, index) => (
              <Col key={index}>
                <Card style={{ width: '15rem' }}>
                  <Card.Img variant="top" src={resolveThumbnailUrl(project.thumbnailUrl)} alt={project.title || '기본 이미지'} style={{ height: '200px', objectFit: 'cover' }} />
                  <Card.Body>
                    <Card.Title>{project.title}</Card.Title>
                    <Card.Text>{project.introduction}</Card.Text>
                    <div className="d-flex justify-content-between">
                      <Button variant="primary" size="sm" onClick={() => handleOpenProjectModal(index)}>
                        등록
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveStaffPickProject(index)}>
                        삭제
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 인기 작품 섹션 */}
        <div className="bt1">
          <h1>인기 작품</h1>
          <p>티코미들에게 이 작품들이 최근 주목 받고 있어요!</p>
          <Row xs={1} md={2} className="g-4">
            {popularProjects.map(project => (
              <Col key={project.project_id}>
                <Card>
                  <Card.Img variant="top" src={resolveThumbnailUrl(project.thumbnailUrl)} alt={project.title || '인기 작품'} style={{ height: '200px', objectFit: 'cover' }} />
                  <Card.Body>
                    <Card.Title>{project.title}</Card.Title>
                    <Card.Text>{project.introduction}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 작품 선택 모달 */}
      <ProjectListModal
        show={showProjectModal}
        onHide={handleCloseProjectModal}
        onProjectSelect={handleSelectProject}
      />

      {/* 로그인 유저가 사원이면 ErpLogo, 일반 유저면 ChatbotWindow로 로고 변경 */}
      <div>
        {userRole === 'EMPLOYEE' ? (
          <ErpLogo visible={true} /> /* visible props로 넘기기 */
        ) : (
          <ChatbotWindow />
        )}
      </div>
    </div>
  );
}

export default MainModify;