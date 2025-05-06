import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Dropdown, Tabs, Tab } from 'react-bootstrap';
import axiosInstance from '../login/social/utils/axiosInstance';
import './StudyDetail2.css';
import ShareCanvas from '../../blockly/components/BlocklyComponentRun';
import StudyCommentSection from './StudyCommentSection';

function StudyDetail2() {
  const [study, setStudy] = useState(null); // 상세 스터디 정보 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const { studyId } = useParams(); // URL 파라미터에서 studyId 가져오기
  const navigate = useNavigate();
  const userUuid = localStorage.getItem('user_uuid');
  const [creater, setCreater] = useState(null);

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
        // 제작자 정보 설정
        const projectCreatorUuid = res.userUuid;  // project.userUuid를 사용
        setCreater(projectCreatorUuid);  // 제작자 userUuid를 상태에 설정
      })
      .catch(() => {
        alert('스터디 상세 정보 조회 실패');
        setIsLoading(false);
      });
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 스터디를 삭제하시겠습니까?')) {
      axiosInstance.delete(`/api/study/${studyId}`)
        .then(() => {
          alert('스터디가 삭제되었습니다.');
          navigate('/shareStudy'); // 목록 페이지로 이동
        })
        .catch(() => alert('삭제에 실패했습니다.'));
    }
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

  const handleToggleComment = () => {
    // next 상태 결정
    const nextState = study.iscomment === 'Y' ? 'N' : 'Y';
    axiosInstance.put(`/api/study/comment/${study.studyId}`, { iscomment: nextState })
      .then(() => {
        alert('댓글 허용/비허용 상태가 변경되었습니다.');
        setStudy({ ...study, iscomment: nextState });
      })
      .catch(() => alert('상태 변경에 실패했습니다.'));
  };

  const handleReport = () => {
    if (!userUuid) {
      alert("로그인 후 사용 가능합니다.");
      navigate("/login");
      return;
    }

    navigate(`/studyReport/${study.studyId}`);
  }

  if (isLoading) { return <div>로딩 중...</div>; }

  const isOwner = study.userUuid === userUuid;

  return (
    <Container className="study-detail-page py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <Card.Title as="h2" className="text-center mb-4" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                <ShareCanvas projectId={study.projectId} />
                {study.title}
                <span 
                  className={`study-badge ${study.isprivate === 'Y' ? 'study-badge-private' : 'study-badge-public'}`}>
                  {study.isprivate === 'Y' ? '비공개' : '공개'}
                </span>
                <Dropdown align="end" className="float-end">
                  <Dropdown.Toggle variant="light" id="dropdown-basic">
                    <span style={{ fontSize: "2rem" }}>⋮</span>
                  </Dropdown.Toggle>
                 {isOwner ? (
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => navigate(`/study/edit/${study.studyId}`)}>
                            수정하기
                          </Dropdown.Item>
                          <Dropdown.Item onClick={handleDelete}>
                            삭제하기
                          </Dropdown.Item>
                          <Dropdown.Item onClick={handleTogglePrivate}>
                            {study.isprivate === 'Y' ? '공개로 변경' : '비공개로 변경'}
                          </Dropdown.Item>
                          <Dropdown.Item onClick={handleToggleComment}>
                            {study.iscomment === 'Y' ? '댓글 사용 안 함' : '댓글 사용'}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      ) : (
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={handleReport}>
                            신고하기
                          </Dropdown.Item>
                        </Dropdown.Menu>
                    )}
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
            </Card.Body>
          </Card>
          {study.iscomment === 'Y' ? (
            <StudyCommentSection
              studyId={study.studyId}
              userUuid={userUuid}
              studyCreatorUuid={study.userUuid}
              isPrivate={study.isprivate}
            />
          ) : (
            <div className="text-center my-5 text-muted">댓글을 사용하지 않습니다.</div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default StudyDetail2;