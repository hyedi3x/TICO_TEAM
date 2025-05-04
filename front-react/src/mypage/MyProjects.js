import React, { useState, useEffect } from 'react';
import axiosInstance from '../pages/login/social/utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

function MyProjects() {
  const [works, setWorks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인한 사용자 정보 가져오기 (예: user_uuid)
    const userUuid = localStorage.getItem('user_uuid');  // 로그인 상태 확인

    if (userUuid) {
      // API 호출하여 로그인한 사용자의 작품 목록을 불러오기
      axiosInstance.get(`/api/project/userProjects/${userUuid}`)
        .then(response => {
          setWorks(response.data);  // 서버로부터 받은 작품 목록 저장
        })
        .catch(error => {
          console.error("작품 목록을 불러오는 데 실패했습니다:", error);
        });
    }
  }, []);

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url; // 이미 전체 URL이면 그대로
    return `https://tico.kro.kr${url}`;    // 상대경로면 도메인 붙여줌
  };

  return (
    <Container className="my-works py-5">
      <h2 className="mb-4 text-center">내 작품</h2>
      <Row className='project-grid justify-content-center'>
        {works.length === 0 ? (
          <p className="text-center">만든 작품이 없습니다.</p>
        ) : (
          works.map((work) => (
            <Col md={4} key={work.projectId} className="mb-4">
              <Card className='project-card' onClick={() => navigate(`/share/detail/${work.projectId}`)}>
                {/* 작품 이미지 */}
                <Card.Img 
                  className='thumbnail'
                  variant="top" 
                  src={resolveThumbnailUrl(work.thumbnailUrl)} 
                  alt={work.title}
                  style={{ height: '200px', objectFit: 'contain' }}
                />
                <Card.Body>
                  <Card.Title>{work.title}</Card.Title>
                  <Card.Text>{work.description}</Card.Text>
                  <Card.Text className="project-stats">
                    👍 {work.likeCount} &nbsp;&nbsp;
                    👁️ {work.viewCount} &nbsp;&nbsp;
                    💬 {work.commentCount}
                  </Card.Text>
                  <div className="mt-2">
                    <Badge bg={work.isPrivate === 'Y' ? 'danger' : 'success'}>
                      {work.isPrivate === 'Y' ? '비공개' : '공개'}
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

export default MyProjects;
