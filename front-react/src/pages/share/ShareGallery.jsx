import React, { useEffect, useState } from 'react';
import axiosInstance from '../login/social/utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './ShareGallery.css';
import ShareModal from './ShareModal';

function ShareGallery() {
  const [projects, setProjects] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false); // ✅ 모달 상태 추가
  const userUuid = localStorage.getItem('user_uuid');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects(); // ✅ 모달 공유 완료 후에도 다시 불러오기 위해 함수화
  }, []);

  const fetchProjects = () => {
    axiosInstance.get("/project/public")
      .then((res) => setProjects(res.data))
      .catch(() => alert("작품 목록 조회 실패"));
  };

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url; // 이미 전체 URL이면 그대로
    return `http://localhost:8081${url}`;    // 상대경로면 도메인 붙여줌
  };

  const showModal = (id) => {
    if(id === null){
      alert('로그인 후 이용하세요');
      navigate('/login');
    }
    setShowShareModal(true);
  };

  return (
    <Container className="share-gallery">
      {/* 상단 제목 + 버튼 */}
      <div className="gallery-header">
        <h2>작품 공유하기</h2>
        <Button variant="success" onClick={() => showModal(userUuid)}>
          + 작품 공유하기
        </Button>
      </div>

      {/* 공유된 작품이 없는 경우 */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <img src="/imgs/no-projects.png" alt="없음" />
          <p>아직 공유된 작품이 없습니다.</p>
          <p>상단의 <strong>작품 공유하기</strong> 버튼을 눌러 공유를 시작해보세요!</p>
        </div>
      ) : (
        <Row className="project-grid">
          {projects.map((project) => (
            <Col key={project.projectId} xs={12} sm={6} md={4} lg={3}>
              <Card className="project-card" onClick={() => navigate(`/share/detail/${project.projectId}`)}>
                <Card.Img
                  variant="top"
                  src={resolveThumbnailUrl(project.thumbnailUrl)}
                  className="thumbnail"
                />
                <Card.Body>
                  <Card.Title>{project.title}</Card.Title>
                  <Card.Text className="project-stats">
                    👍 {project.likeCount} &nbsp;&nbsp;
                    👁️ {project.viewCount} &nbsp;&nbsp;
                    💬 {project.commentCount}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ✅ 모달 컴포넌트 렌더링 */}
      <ShareModal
        show={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          fetchProjects(); // 공유 완료 후 목록 갱신
        }}
      />
    </Container>
  );
}

export default ShareGallery;
