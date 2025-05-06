import React, { useEffect, useState } from 'react';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function StudyManage() {
  const [studies, setStudies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/study/all')  // 관리자는 전체 스터디 목록
      .then(res => setStudies(res.data))
      .catch(err => console.error('스터디 로딩 실패', err));
  }, []);

  const resolveThumbnailUrl = (url) => {
    if (!url) return '/default-thumbnail.png'; // 기본 이미지
    return url.startsWith('http') ? url : `http://localhost:8081${url}`;
  };

  const handleCardClick = (studyId) => {
    navigate(`/study/detail/${studyId}`); // 상세페이지로 이동
  };

  return (
    <Container className="my-works py-5">
      <h2 className="mb-4 text-center">전체 스터디 관리</h2>
      <Row className="project-grid justify-content-center">
        {studies.length === 0 ? (
          <p className="text-center">스터디가 없습니다.</p>
        ) : (
          studies.map(study => (
            <Col md={4} key={study.studyId} className="mb-4">
              <Card
                className="project-card"
                onClick={() => handleCardClick(study.studyId)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Img
                  variant="top"
                  src={resolveThumbnailUrl(study.thumbnailUrl)}
                  alt={study.title}
                  style={{ height: '200px', objectFit: 'contain' }}
                />
                <Card.Body>
                  <Card.Title>{study.title}</Card.Title>
                  <Card.Text>
                    <Badge bg="info" style={{ fontSize: '14px' }}>{study.difficulty}</Badge>{' '}
                    <Badge bg="primary" style={{ fontSize: '14px' }}>{study.category}</Badge>{' '}
                    <Badge bg="secondary" style={{ fontSize: '14px' }}>{study.duration}</Badge>
                  </Card.Text>
                  <Badge bg={study.isprivate === 'Y' ? 'danger' : 'success'}>
                    {study.isprivate === 'Y' ? '비공개' : '공개'}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

export default StudyManage;