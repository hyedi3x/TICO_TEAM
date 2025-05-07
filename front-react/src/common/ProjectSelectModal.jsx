import React from 'react';
import { Modal, Button } from 'rsuite';
import ProjectCard from './ProjectCard';

// 썸네일 URL 처리 함수
const resolveThumbnailUrl = (url) => {
  if (url && !url.startsWith('https')) {
    return `https://tico.kro.kr${url}`;
  }
  return url || '';
};

function ProjectSelectModal({ show, onHide, onProjectSelect, projects }) {
  return (
    <Modal open={show} onClose={onHide} size="lg">
      <Modal.Header>
        <Modal.Title style={{ width: '100%', textAlign: 'center', marginBottom: 10,}}>작품 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          {projects.filter(project => project.isPrivate !== 'Y').map((project) => (
            <div key={project.projectId} onClick={() => onProjectSelect(project)} style={{ cursor: 'pointer' }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="subtle" onClick={onHide}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectSelectModal;
