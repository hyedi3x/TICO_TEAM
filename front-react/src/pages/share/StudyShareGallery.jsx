import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Badge } from 'react-bootstrap'; // react-bootstrap 사용
import axiosInstance from '../login/social/utils/axiosInstance';
import './ShareGallery.css'; // 동일한 스타일 사용
import { useNavigate } from 'react-router-dom';
import StudyShareModal from './StudyShareModal'; // StudyShareModal 컴포넌트 임포트

function StudyShareGallery() {
  const [studies, setStudies] = useState([]); // 스터디 목록 상태
  const [showShareModal, setShowShareModal] = useState(false); // 모달 상태
  const userUuid = localStorage.getItem('user_uuid');
  const navigate = useNavigate();

  // 공개된 스터디 목록을 가져옵니다.
  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = () => {
    axiosInstance.get("/api/study/public")
      .then((res) => { setStudies(res.data); })
      .catch(() => alert("스터디 목록 조회 실패"));
  };

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url; // 이미 전체 URL이면 그대로
    return `http://localhost:8081${url}`; // 상대경로이면 도메인 붙여줌
  };

  const showModal = () => {
    if (!userUuid) {
      alert('로그인 후 이용하세요');
      navigate('/login');
      return;
    }
    setShowShareModal(true); // 모달 표시
  };

  return (
    <Container className="share-gallery">
      <div className="header-grid">
        <h2>스터디 공유하기</h2>
        <Button variant="success" onClick={showModal}>
          + 스터디 공유하기
        </Button>
      </div>
      <div className="gallery-info-box text-center mb-4">
        <h5 className="fw-bold mb-2">💡 이곳은 스터디를 감상하고 소통하는 공간이에요!</h5>
        <p className="text-muted" style={{ fontSize: "15px" }}>
          다른 사람들이 만든 <strong>스터디</strong>를 감상하고 <strong>좋아요</strong>와 <strong>댓글</strong>로 소통해보세요.
        </p>
      </div>

      {studies.length === 0 ? (
        <div className="empty-state">...</div>
      ) : (
        <div className="gallery-grid">
          {studies.map((study) => (
            <Card className="project-card" key={study.studyId} onClick={() => navigate(`/study/detail/${study.studyId}`)}>
              <Card.Img
                variant="top"
                src={resolveThumbnailUrl(study.thumbnailUrl)}
                className="thumbnail"
              />
              <Card.Body>
                <Card.Title>
                  <div className="fw-bold text-dark" style={{textAlign: 'center'}}>{study.title}</div>
                  <div className="text-muted small mt-1" style={{textAlign: 'center'}}>{study.nickname}</div>
                </Card.Title>
                <Card.Text className="project-stats">
                  <Badge pill bg="info" style={{ fontSize: '15px' }}>{study.difficulty}</Badge>
                  <Badge pill bg="primary" style={{ fontSize: '15px', marginLeft: '10px' }}>{study.category}</Badge>
                  <Badge pill bg="secondary" style={{ fontSize: '15px', marginLeft: '10px' }}>{study.duration}</Badge>
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* StudyShareModal을 사용하여 스터디 공유 */}
      <StudyShareModal
        show={showShareModal} // 모달 상태가 true일 때만 모달이 열림
        onClose={() => {
          setShowShareModal(false);
          fetchStudies(); // 모달 닫을 때 스터디 목록 다시 불러오기
        }}
      />
    </Container>
  );
}

export default StudyShareGallery;