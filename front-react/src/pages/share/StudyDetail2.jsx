import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Dropdown, Tabs, Tab } from 'react-bootstrap';
import axiosInstance from '../login/social/utils/axiosInstance';
import './StudyDetail2.css';

function StudyDetail2() {
  const [study, setStudy] = useState(null); // 상세 스터디 정보 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const { studyId } = useParams(); // URL 파라미터에서 studyId 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    if (studyId) {
      fetchStudyDetail();
    }
  }, [studyId]);

  // 스터디 상세 정보를 가져오는 함수
  const fetchStudyDetail = () => {
    setIsLoading(true);
    axiosInstance.get(`/api/study/${studyId}`)
      .then((res) => {
        setStudy(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        alert('스터디 상세 정보 조회 실패');
        setIsLoading(false);
      });
  };

  const handleTogglePrivate = () => {
    const nextState = study.isprivate === 'Y' ? 'N' : 'Y';
    const msg = nextState === 'N'
      ? '이 스터디를 공개로 변경할까요?'
      : '이 스터디를 비공개로 변경할까요?';
    if (window.confirm(msg)) {
      const data = nextState === 'N' ? { isprivate: nextState } : { isprivate: nextState };
      axiosInstance.put(`/api/study/private/${studyId}`, data)
        .then(() => {
          alert('공개/비공개 상태가 변경되었습니다.');
          setStudy({ ...study, isprivate: nextState });
        })
        .catch(() => alert('상태 변경에 실패했습니다.'));
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>; // 로딩 중일 때 표시할 내용
  }

  return (
    <Container className="study-detail-page py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <Card.Title as="h2" className="text-center mb-4" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {study.title}
                <span 
                  className={`study-badge ${study.isPrivate === 'Y' ? 'study-badge-private' : 'study-badge-public'}`}>
                  {study.isPrivate === 'Y' ? '비공개' : '공개'}
                </span>
                <Dropdown align="end" className="float-end">
                  <Dropdown.Toggle variant="light" id="dropdown-basic">
                    <span style={{ fontSize: "2rem" }}>⋮</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleTogglePrivate}>
                      {study.isprivate === 'Y' ? '공개로 변경' : '비공개로 변경'}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Title>
              <div className="study-info mb-4" style={{ fontSize: '1.2rem' }}>
                <p><strong>카테고리:</strong> {study.category}</p>
                <p><strong>난이도:</strong> {study.difficulty}</p>
                <p><strong>예상 소요 시간:</strong> {study.duration}</p>
              </div>
              <Tabs defaultActiveKey="intro" className="mb-3 justify-content-center" fill>
                <Tab eventKey="intro" title="소개">
                  <p className="text-center">{study.introduction || '등록된 소개글이 없습니다.'}</p>
                </Tab>
                <Tab eventKey="goal" title="목표">
                  <p className="text-center">{study.goal || '등록된 목표가 없습니다.'}</p>
                </Tab>
              </Tabs>
              <div className="text-center mt-4">
                <Button variant="outline-primary" size="lg" onClick={() => navigate(`/study/edit/${studyId}`)}>
                  수정하기
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default StudyDetail2;