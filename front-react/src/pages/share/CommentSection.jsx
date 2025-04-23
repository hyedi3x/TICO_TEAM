import React, { useState, useEffect } from 'react';
import axiosInstance from '../login/social/utils/axiosInstance';
import { Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './CommentSection.css';

function CommentSection({ projectId, userUuid, projectCreatorUuid, isPrivate }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  // 댓글 불러오기
  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/projectComments/${projectId}`);
      setComments(res.data);
    } catch (error) {
      alert('댓글 불러오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  // 댓글 등록
  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axiosInstance.post(`/projectComments`, {
        projectId,
        userUuid,
        commentText: newComment
      });
      setNewComment('');
      fetchComments(); // 등록 후 새로고침
    } catch (error) {
      alert('댓글 등록 실패:', error);
    }
  };

  // 댓글 입력 클릭 시 로그인 여부 확인
  const handleCommentInputClick = () => {
    if (!userUuid) {
      alert("댓글을 작성하려면 로그인 후 이용해주세요.");
      navigate("/login");  // 로그인 페이지로 리디렉션
    }

    if(isPrivate === 'Y'){
      alert("비공개된 작품입니다.");
      return;
    }
  };

  return (
    <div className="comment-section mt-5">
      <h5>💬 댓글 {comments.length}개</h5>

      {/* 댓글 입력 */}
      <Form.Group className="mb-3">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="댓글을 입력해 주세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onClick={handleCommentInputClick}
          className="comment-input"  // 추가된 클래스
        />
        <div className="text-end mt-2">
          <Button variant="primary" onClick={submitComment} className="submit-btn">
            등록
          </Button>
        </div>
      </Form.Group>

      {/* 댓글 리스트 */}
      <ListGroup variant="flush">
        {comments.map((c) => (
          <ListGroup.Item key={c.commentId} className="comment-item">
            <Row>
              <Col>
                <strong>{c.nickname}</strong> &nbsp;
                {c.userUuid === projectCreatorUuid && (
                  <span className='badge bg-info'>작성자</span>
                )}
                <small className="text-muted comment-time">
                  {new Date(c.createdAt).toLocaleString()}
                </small>
              </Col>
            </Row>
            <Row className="mt-1">
              <Col>{c.commentText}</Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default CommentSection;