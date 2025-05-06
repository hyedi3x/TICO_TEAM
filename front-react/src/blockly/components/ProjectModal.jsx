import React from 'react';
import { Button, Card, Col, Grid, Modal, Row } from 'rsuite';

function ProjectModal({ show, onClose, projectList, onSelect }) {
  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  };

  return (
    <Modal open={show} onClose={onClose} size="lg">
      <Modal.Header>
        <Modal.Title style={{ width: '100%', textAlign: 'center' }}>저장된 작품 목록</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Grid fluid>
          <Row gutter={16}>
            {projectList.map((project) => (
              <Col xs={24} sm={12} md={8} key={project.projectId} style={{ marginBottom: 24 }}>
                <Card 
                  style={{
                    cursor: 'pointer',
                    minWidth: 260,
                    minHeight: 330,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.09)',
                    borderRadius: 18,
                    fontSize: 17
                  }}
                  onClick={() => onSelect(project)}
                  className="rsuite-project-card"
                >
                <img
                  src={resolveThumbnailUrl(project.thumbnailUrl)}
                  style={{ width: '100%', height: 200, objectFit: 'contain', borderRadius: '18px 18px 0 0' }}
                  alt={project.title}
                />
                <Card.Body>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 16, marginBottom: 8 }}>
                    <span>👁 {project.viewCount || 0}</span>
                    <span>❤️ {project.likeCount || 0}</span>
                    <span>💬 {project.commentCount || 0}</span>
                  </div>
                  <div style={{
                    marginTop: 10,
                    textAlign: 'center',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    fontSize: 19
                  }}>
                    {project.title}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            ))}
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="subtle" onClick={onClose}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectModal;