import React from 'react';
import { Card, Button } from 'react-bootstrap';
import img1 from '../imgs/짱구1.jpg';

// 🔧 유틸: 썸네일 처리
const resolveThumbnailUrl = (url) => {
  if (url && !url.startsWith('http')) {
    return `http://localhost:8081${url}`;
  }
  return url || img1;
};

// ⭐ ProjectCard 컴포넌트 (재사용 가능)
const ProjectCard = ({ project, editable = false, onSelect, onDelete, onClick, showStats = true, extraButtons }) => {
  return (
    <Card
      className="staff-card shadow-sm rounded-4 p-2 text-center"
      style={{ minHeight: '350px', maxHeight: '350px' }} // 🎯 고정
      onClick={onClick}
    >
      {/* 🔹 이미지 */}
      {project.projectId ? (
        <Card.Img
          variant="top"
          src={resolveThumbnailUrl(project.thumbnailUrl)}
          alt={project.title}
          className="rounded-3 mb-3"
          style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center rounded-3 mb-3"
          style={{ height: '180px', backgroundColor: '#f8f9fa' }}
        >
          <span className="text-muted">등록해주세요</span>
        </div>
      )}

      {/* 🔹 본문 */}
      <Card.Body>
        <Card.Title className="fw-bold" style={{ fontSize: '1rem' }}>{project.title}</Card.Title>
        <Card.Text className="text-muted" style={{ fontSize: '0.85rem' }}>{project.introduction}</Card.Text>
      </Card.Body>

      {/* 🔹 하단 통계 (인기작품용) */}
      {showStats && (
        <Card.Footer
          className="d-flex justify-content-between px-3 py-2 text-muted"
          style={{ fontSize: '0.8rem', backgroundColor: '#fff' }}
        >
          <div>❤️ {project.likeCount || 0}</div>
          <div>🔖 {project.bookmarkCount || 0}</div>
          <div>👁 {project.viewCount || 0}</div>
        </Card.Footer>
      )}
      {extraButtons && ( // 메인 베너 관리
        <div className="d-flex justify-content-center gap-2 mb-3">
            {extraButtons}
        </div>
        )}
      {/* 🔹 관리 버튼 (스태프 선정 페이지용) */}
      {editable && (
        <div className="d-flex justify-content-center gap-2 mt-2 mb-3">
          <Button
            variant="outline-primary"
            size="sm"
            className="rounded-pill px-3"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            등록
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            className="rounded-pill px-3"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            삭제
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProjectCard;
