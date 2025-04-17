// src/components/ProjectModal.jsx
import React from 'react';
import { Modal, Button, Card, Row, Col } from 'react-bootstrap';

function ProjectModal({ show, onClose, projectList, onSelect }) {

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url; // 이미 전체 URL이면 그대로
    return `http://localhost:8081${url}`;    // 상대경로면 도메인 붙여줌
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Modal.Title>저장된 작품 목록</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {projectList.map((project) => (
            <Col 
                key={project.projectId}
                xs={6} 
                md={4} 
                lg={3} 
                className="mb-4"
                onClick={() => onSelect(project)}
                style={{cursor: 'pointer'}}
            >

              <Card style={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Card.Img
                  variant="top"
                  src={resolveThumbnailUrl(project.thumbnailUrl)}
                  style={{objectFit: 'cover' }}
                />
                <Card.Footer className="d-flex justify-content-between text-muted" style={{ fontSize: '0.8rem' }}>
                  <div>👁 {project.views || 0}</div>
                  <div>❤️ {project.likes || 0}</div>
                  <div>💬 {project.comments || 0}</div>
                </Card.Footer>
                <Card.Title className="text-truncate" style={{"textAlign": "center"}}>{project.title}</Card.Title>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectModal;
