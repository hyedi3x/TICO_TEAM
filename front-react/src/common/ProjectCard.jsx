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
const ProjectCard = ({ project, editable = false, onSelect, onDelete, onClick, showStats = true, extraButtons = false}) => {
  return (
    <Card
      className="staff-card shadow-sm rounded-4 p-2 text-center"
      style={{ minHeight: '320px', maxHeight: '320px' ,minWidth: "220px", maxWidth: "220px"}}
    >
      {/* 🔹 이미지 */}
        <Card.Img
          variant="top"
          src={resolveThumbnailUrl(project.thumbnailUrl)}
          alt={project.title}
          className="rounded-3 mb-3"
          style={{ width: '100%', minHeight: '150px',maxHeight:'150px', objectFit: 'contain', overflow:'hidden', backgroundColor: '#f8f9fa' }}
        />
      {/* 🔹 본문 */}
      <Card.Body style={{maxHeight:'80px', minHeight: '80px'}}>
        {/* 타이틀 (한 줄로 제한하고, 넘치면 ... 처리) */}
        <Card.Title
          className="fw-bold text-truncate"
          // 줄바꿈 금지, 텍스트 넘치면 ... 처리
          style={{ fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {project.title}
        </Card.Title>

        {/* 본문 (두 줄로 제한하고, 세로로 쌓기, 넘치면 ... 처리) */}
        <Card.Text
          className="text-muted"
          style={{
            fontSize: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,  // 2줄로 제한
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {project.introduction}
        </Card.Text>
      </Card.Body>

      {/* 🔹 하단 통계 (인기작품용) */}
      {showStats && (
        <Card.Footer
          className="d-flex justify-content-between px-3 py-2 text-muted"
          style={{ fontSize: '12px', backgroundColor: '#fff' }}
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
          <Button variant="outline-primary" size="sm" className="rounded-pill px-3"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            등록
          </Button>
          <Button variant="outline-danger" size="sm" className="rounded-pill px-3"
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
