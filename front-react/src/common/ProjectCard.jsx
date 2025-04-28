import React from 'react';
import { Button, Card, Tag } from 'rsuite';

const resolveThumbnailUrl = (url) => {
  if (url && !url.startsWith('http')) {
    return `http://localhost:8081${url}`;
  }
  return url || '';
};

const ProjectCard = ({ project, onClick, extraButtons=false, editable=false, isPopular=false, isStaff=false}) => {
  if (!project) return null;
  return (
    <Card
      style={{
        width: 200,
        height: 'auto',
        borderRadius: 15,
        boxShadow: '0 0px 18px rgba(0, 132, 255, 0.10)',
        overflow: 'hidden',
        background: '#fff',
        padding: 0,
        margin: '0 auto'
      }}
      onClick={onClick}
    >
      {/* 이미지 & 배지 */}
      <div style={{ position: 'relative', width: '100%', height: 110, background: '#eee' }}>
        <img
          src={resolveThumbnailUrl(project.thumbnailUrl)}
          alt={project.title}
          style={{
            width: '100%',
            height: 140,
            objectFit: 'cover',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            display: 'block'
          }}
        />
        {/* 예시: 카테고리, 인작 뱃지 */}
        {isStaff && <Tag color="green" style={{ position: 'absolute', top: 10, left: 10, fontSize: 14, padding: '2px 8px' }}>🌟스선</Tag> }
        {isPopular && <Tag color="blue" style={{ position: 'absolute', top: 10, right: 10, fontSize: 14, padding: '2px 8px' }}>🔥인작</Tag> }
      </div>
      {/* 본문 */}
      <div style={{
        padding: '12px 14px 8px 14px',
        background: '#fff',
        height: 78
      }}>
        {/* 제목 */}
        <div style={{
          fontWeight: 700,
          fontSize: 15,
          marginBottom: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {project.title}
        </div>
        {/* 설명/부제 */}
        <div style={{
          color: '#555',
          fontSize: 13,
          marginBottom: 3,
          height: 17,
          overflow: 'hidden',
          WebkitLineClamp: 2,
          textOverflow: 'ellipsis'
        }}>
          {project.introduction || '등록된 소개글이 없습니다.'}
        </div>
        {/* 작성자 */}
        <div style={{ color: '#999', fontSize: 12, marginBottom: 1 }}>
          {project.nickName || '닉네임으로 수정예정'}
        </div>
      </div>
      {/* 하단 통계 */}
      <div className="d-flex justify-content-center gap-2 mt-2 mb-3">
        {extraButtons}
        {editable}
      </div>
      {project &&  
        (project.likeCount != null || project.bookMarkCount != null || project.viewCount != null) && (
          <div style={{
            borderTop: '1px solid #f1f1f1',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            color: '#888',
            height: 36,
            padding: '0 12px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 14 }}>❤️</span>
              {project.likeCount || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 14 }}>🔖</span>
              {project.bookMarkCount || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 14 }}>👁</span>
              {project.viewCount || 0}
            </span>
          </div>
      )}
      
    </Card>
  );
};

export default ProjectCard;
