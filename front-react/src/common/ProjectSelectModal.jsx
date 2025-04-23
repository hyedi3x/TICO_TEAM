import React from 'react';
import { Modal, Button } from 'rsuite';
import img1 from '../imgs/짱구1.jpg';

// 썸네일 URL 처리 함수
const resolveThumbnailUrl = (url) => {
  if (url && !url.startsWith('http')) {
    return `http://43.202.174.19:8081${url}`;
  }
  return url || img1;
};

function ProjectSelectModal({ show, onHide, onProjectSelect, projects }) {
  return (
    <Modal open={show} onClose={onHide} size="lg"> {/* show : 모달 표시 여부, onHide : 모달 닫을 때 실행되는 콜백함수 */}
      <Modal.Header>
        <Modal.Title style={{ width: '100%', textAlign: 'center' }}>작품 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          {projects.map((project) => (
            <div // 4행 n열
              key={project.projectId}
              className="col mb-4"
              onClick={() => onProjectSelect(project)} // 작품 중복 등록 방지
              style={{ cursor: 'pointer', display: 'inline-block' }}
            >
              <div style={{ height: '300px', width: '230px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                <img
                  src={resolveThumbnailUrl(project.thumbnailUrl)}
                  alt="thumbnail"
                  style={{ width: '230px', height: '180px', objectFit: 'contain' }}
                />
                <div style={{ padding: '10px' }}>
                  <div className="text-truncate text-center" style={{ fontSize: '16px' }}>
                    {project.title}
                  </div>
                  <div className="text-muted text-center" style={{ fontSize: '12px' }}>
                    {project.introduction?.substring(0, 50)}{project.introduction?.length > 50 && '...'} {/* 길이 초과 방지 */}
                  </div>
                </div>
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: '12px', padding: '10px' }}>
                  <div>👁 {project.viewCount || 0}</div>
                  <div>❤️ {project.likeCount || 0}</div>
                  <div>💬 {project.commentCount || 0}</div>
                </div>
              </div>
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
