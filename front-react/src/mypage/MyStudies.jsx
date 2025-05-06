import React, { useState, useEffect } from 'react';
import axiosInstance from '../pages/login/social/utils/axiosInstance';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function MyStudies() {
  const [studies, setStudies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userUuid = localStorage.getItem('user_uuid');  // 로그인 상태 확인

    if (userUuid) {
      axiosInstance.get(`/api/study/list?userUuid=${userUuid}`)
        .then(response => {
          setStudies(response.data);  // 서버로부터 받은 스터디 목록 저장
        })
        .catch(error => {
          console.error("스터디 목록을 불러오는 데 실패했습니다:", error);
        });
    }
  }, []);

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;  // 상대경로면 도메인 붙여줌
  };

  return (
    <Container className="my-works py-5">
      <h2 className="mb-4 text-center">내 스터디</h2>
      <Row className='project-grid justify-content-center'>
        {studies.length === 0 ? (
          <p className="text-center">등록한 스터디가 없습니다.</p>
        ) : (
          studies.map((study) => (
            <Col md={4} key={study.studyId} className="mb-4">
              <Card className='project-card'>
                {/* 썸네일 이미지 */}
                <Card.Img
                  className='thumbnail'
                  variant="top"
                  src={resolveThumbnailUrl(study.thumbnailUrl)}
                  alt={study.title}
                  style={{ height: '200px', objectFit: 'contain' }}
                />
                <Card.Body>
                  <Card.Title>{study.title}</Card.Title>
                  <Card.Text className="project-stats">
                    <Badge pill bg="info" style={{ fontSize: '15px' }}>{study.difficulty}</Badge>
                    <Badge pill bg="primary" style={{ fontSize: '15px', marginLeft: '10px' }}>{study.category}</Badge>
                    <Badge pill bg="secondary" style={{ fontSize: '15px', marginLeft: '10px' }}>{study.duration}</Badge>
                  </Card.Text>
                  <div className="mt-2">
                    <Badge
                      bg={study.isprivate === 'Y' ? 'danger' : 'success'}
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        padding: '6px 10px',
                      }}
                    >
                      {study.isprivate === 'Y' ? '비공개' : '공개'}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

export default MyStudies;