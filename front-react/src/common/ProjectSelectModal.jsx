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
    <Modal show={show} onHide={onHide} size="lg"> {/* show : 모달 표시 여부, onHide : 모달 닫을 때 실행되는 콜백함수 */}
      <Modal.Header closeButton>
        <Modal.Title style={{ width: '100%', textAlign: 'center' }}>작품 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {projects.map((project) => (
            <Col // 4행 n열
              key={project.projectId} className="mb-4" 
              onClick={() => onProjectSelect(project)} // 작품 중복 등록 방지
              style={{ cursor: 'pointer' }}
            >
              <Card style={{ height: '300px', width: '230px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Card.Img
                  variant="top"
                  src={resolveThumbnailUrl(project.thumbnailUrl)}
                  style={{ width: '230px', height: '180px', objectFit: 'contain'}}
                />
                <Card.Body style={{ padding: '10px' }}>
                  <Card.Title className="text-truncate text-center" style={{ fontSize: '16px' }}>
                    {project.title}
                  </Card.Title>
                  <Card.Text className="text-muted text-center" style={{ fontSize: '12px' }}>
                    {project.introduction?.substring(0, 50)}{project.introduction?.length > 50 && '...'} {/* 길이 초과 방지 */}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between text-muted" style={{ fontSize: '12px', padding: '10px' }}>
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