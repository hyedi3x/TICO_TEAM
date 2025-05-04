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
    axiosInstance.get("/api/project/public")
      .then((res) => setProjects(res.data))
      .catch(() => alert("작품 목록 조회 실패"));
  };

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url; // 이미 전체 URL이면 그대로
    return `https://tico.kro.kr${url}`;    // 상대경로면 도메인 붙여줌
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
      <div className="header-grid">
        <h2>작품 공유하기</h2>
        <Button variant="success" onClick={() => showModal(userUuid)}>
          + 작품 공유하기
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">...</div>
      ) : (
        <div className="gallery-grid">
          {projects.map((project) => (
            <Card className="project-card" key={project.projectId} onClick={() => navigate(`/share/detail/${project.projectId}`)}>
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
          ))}
        </div>
      )}

      <ShareModal show={showShareModal} onClose={() => {
        setShowShareModal(false);
        fetchProjects();
      }} />
    </Container>
  );
}

export default ShareGallery;
