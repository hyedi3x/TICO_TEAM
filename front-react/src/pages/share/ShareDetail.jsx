import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Tabs, Tab, Button } from 'react-bootstrap';
import './ShareDetail.css';
import CommentSection from './CommentSection';
import ShareCanvas from '../../blockly/components/BlocklyComponentRun';

function ShareDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const userUuid = localStorage.getItem('user_uuid');

  useEffect(() => {
    if (!projectId || !userUuid) return;

    // [1] 조회수 증가
    axios.post(`http://localhost:8081/project/view/${projectId}`)
    .catch(err => console.error('조회수 업데이트 실패:', err));

     // 작품 정보
     axios.get(`http://localhost:8081/project/${projectId}`)
     .then(res => {
       const data = res.data.project || res.data;
       setProject(data);
       setLikeCount(data.likeCount || 0);
       setBookmarkCount(data.bookmarkCount || 0);
     })
     .catch(err => console.error(err));

      // 좋아요 여부 확인
    axios.get(`http://localhost:8081/favor/status`, {
        params: { projectId, userUuid, type: 'like' }
      }).then(res => setLiked(res.data)).catch(() => {});
  
      // 북마크 여부 확인
      axios.get(`http://localhost:8081/favor/status`, {
        params: { projectId, userUuid, type: 'bookmark' }
      }).then(res => setBookmarked(res.data)).catch(() => {});
  }, [projectId, userUuid]);

  const handleToggleFavor = (type) => {
    axios.post(`http://localhost:8081/favor/toggle`, {
      projectId: parseInt(projectId),
      userUuid,
      favorType: type
    })
    .then(() => {
      if (type === 'like') {
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      } else {
        setBookmarked(prev => !prev);
        setBookmarkCount(prev => bookmarked ? prev - 1 : prev + 1);
      }
    })
    .catch(err => console.error(`${type} 처리 실패`, err));
  };

  if (!project) return <div className="text-center mt-5">로딩 중...</div>;

  return (
    <Container className="share-detail-container py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg p-4">
            <div className="text-center mb-4">
             <ShareCanvas projectId={projectId} />
            </div>
            <Card.Body>
              <Card.Title as="h2" className="text-center mb-4">
                {project.title}
              </Card.Title>

              <Tabs defaultActiveKey="intro" className="mb-3 justify-content-center" fill>
                <Tab eventKey="intro" title="소개">
                  <p className="text-center">{project.introduction || '등록된 소개글이 없습니다.'}</p>
                </Tab>
                <Tab eventKey="guide" title="사용법">
                  <p className="text-center">{project.guide || '등록된 사용법이 없습니다.'}</p>
                </Tab>
                <Tab eventKey="notes" title="참고사항">
                  <p className="text-center">{project.notes || '등록된 참고사항이 없습니다.'}</p>
                </Tab>
              </Tabs>

              <div className="favor-buttons text-center mt-4">
                <Button
                  variant={liked ? "danger" : "outline-danger"}
                  className="me-3"
                  onClick={() => handleToggleFavor('like')}
                >
                  ❤️ {likeCount}
                </Button>
                <Button
                  variant={bookmarked ? "warning" : "outline-warning"}
                  onClick={() => handleToggleFavor('bookmark')}
                >
                  📌 {bookmarkCount}
                </Button>
              </div>
            </Card.Body>
          </Card>
          <CommentSection
            projectId={project.projectId}
            userUuid={localStorage.getItem('user_uuid')}
            />
        </Col>
      </Row>
    </Container>
  );
}

export default ShareDetail;