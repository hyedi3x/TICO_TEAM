import React from 'react';
import { Modal, Row, Col, Card, Button } from 'react-bootstrap';
import img1 from '../imgs/짱구1.jpg';

// 썸네일 URL 처리 함수
const resolveThumbnailUrl = (url) => {
  if (url && !url.startsWith('http')) {
    return `http://localhost:8081${url}`;
  }
  return url || img1;
};

function ProjectSelectModal({ show, onHide, onProjectSelect, projects }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ width: '100%', textAlign: 'center' }}>작품 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
                  style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                />
                <Card.Body style={{ padding: '0.5rem' }}>
                  <Card.Title className="text-truncate text-center" style={{ fontSize: '1rem' }}>
                    {project.title}
                  </Card.Title>
                  <Card.Text className="text-muted text-center" style={{ fontSize: '0.8rem' }}>
                    {project.introduction?.substring(0, 50)}{project.introduction?.length > 50 && '...'}
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectSelectModal;