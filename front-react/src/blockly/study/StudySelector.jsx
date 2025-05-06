import React, { useEffect, useState } from 'react';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import { Modal, Button, Grid, Row, Col, Badge } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

function StudySelector({ isOpen, onClose, onSelect }) {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const userid = localStorage.getItem("user_uuid");
  
  useEffect(() => {
    if (isOpen) {
      axiosInstance.get(`/api/project/userProjects/${userid}`)
        .then(res => setProjects(res.data))
        .catch(err => console.error('작품 불러오기 실패', err));
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedId) {
      const selectedProject = projects.find(p => p.projectId === selectedId);
      if (selectedProject) {
        onSelect(selectedProject);  // ✅ project 전체 객체 넘김
      }
      onClose();
    }
  };

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  };

  return (
    <Modal open={isOpen} onClose={onClose} backdrop="static" keyboard={false} size="lg">
      <Modal.Header>
        <Modal.Title>완성 작품 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Grid fluid>
          <Row gutter={16}>
            {projects.map(p => (
                <Col xs={12} sm={8} md={6} key={p.projectId}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 10px',
                            marginBottom: 24,
                            border: selectedId === p.projectId ? '2px solid #00c2a0' : '1px solid #ccc',
                            borderRadius: 8,
                            cursor: 'pointer',
                            textAlign: 'center',
                            height: 300,
                        }}
                        onClick={() => setSelectedId(p.projectId)}
                    >
                        <img
                            src={resolveThumbnailUrl(p.thumbnailUrl)}
                            alt="썸네일"
                            style={{
                                width: '90%',
                                height: 200,
                                objectFit: 'obtain',
                                borderRadius: 8,
                            }}
                        />
                        <div style={{ flexShrink: 0 }}>
                            <p style={{ margin: '8px 0 4px' }}>{p.title}</p>
                        </div>
                    
                        {/* 체크 표시 */}
                        {selectedId === p.projectId && (
                            <div style={{
                                fontSize: 20,
                                color: '#00c2a0',
                                fontWeight: 'bold',
                            }}>✔</div>
                        )}
                    
                        {/* 비공개 뱃지 */}
                        {p.isprivate === 'Y' && (
                            <Badge
                                content="비공개"
                                style={{
                                    background: '#888',
                                    color: '#fff',
                                }}
                            />
                        )}
                    </div>
                </Col>
            ))}
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="primary" onClick={handleConfirm}>선택 완료</Button>
        <Button onClick={onClose} appearance="subtle">닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default StudySelector;