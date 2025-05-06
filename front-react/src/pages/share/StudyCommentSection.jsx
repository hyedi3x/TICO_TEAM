import React, { useState, useEffect } from 'react';
import axiosInstance from '../login/social/utils/axiosInstance';
import { Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './CommentSection.css';

function StudyCommentSection({ studyId, userUuid, studyCreatorUuid, isPrivate }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const navigate = useNavigate();
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        if (!studyId) return;
        axiosInstance.get(`/api/studyComments/${studyId}`)
        .then(res => {setComments(res.data); setCommentCount(res.data.length)})
        .catch(err => alert('댓글 불러오기 실패'));
    }, [studyId]);

    const submitComment = async () => {
        if (!newComment.trim()) return;
        try {
            await axiosInstance.post(`/api/studyComments`, {
                studyId,
                userUuid,
                commentText: newComment
            });
            setNewComment('');
            const res = await axiosInstance.get(`/api/studyComments/${studyId}`);
            setComments(res.data);
            setCommentCount(res.data.length);  // ✅ 여기 추가
        } catch (err) {
            alert('댓글 등록 실패');
        }
    };

    const handleCommentInputClick = () => {
        if (!userUuid) {
        alert("댓글을 작성하려면 로그인 후 이용해주세요.");
        navigate("/login");
        }
        if (isPrivate === 'Y') {
        alert("비공개된 스터디입니다.");
        }
    };

    return (
        <div className="comment-section mt-5">
        <h5>💬 댓글 {commentCount}개</h5>
        <Form.Group className="mb-3">
            <Form.Control
            as="textarea"
            rows={3}
            placeholder="댓글을 입력해 주세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={handleCommentInputClick}
            className="comment-input"
            />
            <div className="text-end mt-2">
            <Button variant="primary" onClick={submitComment}>등록</Button>
            </div>
        </Form.Group>

        <ListGroup variant="flush">
            {comments.map((c) => (
            <ListGroup.Item key={c.commentId} className="comment-item">
                <Row>
                <Col>
                    <strong>{c.nickname}</strong>
                    {c.userUuid === studyCreatorUuid && (
                    <span className='badge bg-info'>작성자</span>
                    )}
                    <small className="text-muted ms-2">
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

export default StudyCommentSection;