import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../login/social/utils/axiosInstance';
import { Container, Row, Col, Card, Tabs, Tab, Button, Dropdown } from 'react-bootstrap';
import './ShareDetail.css';
import CommentSection from './CommentSection';
import ShareCanvas from '../../blockly/components/BlocklyComponentRun';
import { handleDeleteProject } from '../../blockly/utils/deleteProject';

function ShareDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [creater, setCreater] = useState(null);

  const userUuid = localStorage.getItem('user_uuid');
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;
  
    // 작품 정보 조회 후 조회수 증가
    axiosInstance.get(`/api/project/${projectId}`)
      .then(res => {
        const data = res.data.project || res.data;
        setProject(data);  // 프로젝트 데이터 상태 업데이트
        setLikeCount(data.likeCount || 0);
        setBookmarkCount(data.bookmarkCount || 0);
        
        // 조회수 증가 (setProject 이후)
        if (data.isPrivate !== 'Y') {
          axiosInstance.post(`/api/project/view/${projectId}`, null, {
            params: { userUuid }
          })
          .catch(err => console.error('조회수 업데이트 실패:', err));
        }
  
        // 제작자 정보 설정
        const projectCreatorUuid = data.userUuid;  // project.userUuid를 사용
        setCreater(projectCreatorUuid);  // 제작자 userUuid를 상태에 설정
      })
      .catch(err => console.error(err));
  
    if (userUuid) {
      // 좋아요 여부 확인
      axiosInstance.get(`/api/favor/status`, {
        params: { projectId, userUuid, type: 'like' }
      }).then(res => setLiked(res.data)).catch(() => {});
  
      // 북마크 여부 확인
      axiosInstance.get(`/api/favor/status`, {
        params: { projectId, userUuid, type: 'bookmark' }
      }).then(res => setBookmarked(res.data)).catch(() => {});
    }
  }, [projectId, userUuid]);  // 의존성 배열 추가

  const handleToggleFavor = (type) => {
    if (!userUuid) {
      alert("로그인 후 사용 가능합니다.");
      navigate("/login"); // 로그인 페이지로 리디렉션
      return;
    }

    if (project.userUuid === userUuid) {
      alert("자신의 작품에 좋아요/북마크를 할 수 없습니다.");
      return;
    }

    if(project.isPrivate === 'Y'){
      alert("비공개된 작품입니다.");
      return;
    }

    axiosInstance.post(`/api/favor/toggle`, {
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

  const isOwner = project.userUuid === userUuid;

  const handleReport = () => {
    if (!userUuid) {
      alert("로그인 후 사용 가능합니다.");
      navigate("/login");
      return;
    }

    navigate(`/report/${project.projectId}`);
  }

  const handleTogglePrivate = () => {
    const nextState = project.isPrivate === 'Y' ? 'N' : 'Y';
    const msg = nextState === 'N'
      ? '이 작품을 공개로 변경할까요? (공유 및 오픈에 동의해야 공개가 가능합니다)'
      : '이 작품을 비공개로 변경할까요?';
    if (window.confirm(msg)) {
      const data = nextState === 'N'
        ? { isPrivate: nextState, isAgree: 'Y' }
        : { isPrivate: nextState, isAgree: 'N' };
      axiosInstance.put(`/api/project/private/${project.projectId}`, data)
        .then(() => {
          alert('공개/비공개 상태가 변경되었습니다.');
          setProject({ ...project, isPrivate: nextState, isAgree: nextState === 'N' ? 'Y' : project.isAgree });
        })
        .catch(() => alert('상태 변경에 실패했습니다.'));
    }
  };

  const handleToggleComment = () => {
    // next 상태 결정
    const nextState = project.isComment === 'Y' ? 'N' : 'Y';
    axiosInstance.put(`/api/project/comment/${project.projectId}`, { isComment: nextState })
      .then(() => {
        alert('댓글 허용/비허용 상태가 변경되었습니다.');
        setProject({ ...project, isComment: nextState });
      })
      .catch(() => alert('상태 변경에 실패했습니다.'));
  };

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
                <span className={project.isPrivate === 'Y' ? "project-badge-private" : "project-badge-public"}>
                  {project.isPrivate === 'Y' ? '비공개' : '공개'}
                </span>
                <Dropdown align="end" className="float-end">
                  <Dropdown.Toggle variant="light" id="dropdown-basic">
                    <span style={{ fontSize: "2rem" }}>⋮</span>
                  </Dropdown.Toggle>
                  {isOwner ? (
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate(`/project/edit/${project.projectId}`)}>
                          수정하기
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => {handleDeleteProject(project.projectId); navigate("/MypageMain");}}>
                          삭제하기
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleTogglePrivate}>
                          {project.isPrivate === 'Y' ? '공개로 변경' : '비공개로 변경'}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleToggleComment}>
                          {project.isComment === 'Y' ? '댓글 사용 안 함' : '댓글 사용'}
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
          {project.isComment === 'Y' ? (
            <CommentSection
              projectId={project.projectId}
              userUuid={userUuid}
              projectCreatorUuid={creater}
              isPrivate={project.isPrivate}
            />
          ) : (
            <div className="text-center my-5 text-muted">댓글을 사용하지 않습니다.</div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ShareDetail;