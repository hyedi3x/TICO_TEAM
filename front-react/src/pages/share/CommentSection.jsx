import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, ListGroup, Row, Col } from 'react-bootstrap';

function CommentSection({ projectId, userUuid }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 댓글 불러오기
  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/projectComments/${projectId}`);
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
      await axios.post(`http://localhost:8081/projectComments`, {
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

  return (
    <div className="mt-5">
      <h5>💬 댓글 {comments.length}개</h5>

      {/* 댓글 입력 */}
      <Form.Group className="mb-3">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="댓글을 입력해 주세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="text-end mt-2">
          <Button variant="primary" onClick={submitComment}>
            등록
          </Button>
        </div>
      </Form.Group>

      {/* 댓글 리스트 */}
      <ListGroup variant="flush">
        {comments.map((c) => (
          <ListGroup.Item key={c.commentId}>
            <Row>
              <Col>
                <strong>{c.nickname}</strong> &nbsp;
                <small className="text-muted">
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