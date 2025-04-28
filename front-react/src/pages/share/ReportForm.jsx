import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../login/social/utils/axiosInstance';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';

function ReportForm() {
  const { projectId } = useParams();
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const userUuid = localStorage.getItem('user_uuid');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 간단 예시, 서버에서 신고 처리 라우터 필요!

    if (!reason.trim()) {
        alert("신고 사유를 입력해 주세요.");
        return;
    }

    try {
      await axiosInstance.post('/api/project/report', {
        projectId,
        userUuid,
        reason,
      });
      setSubmitted(true);
      setTimeout(() => navigate(-1), 1500); // 1.5초 후 이전 페이지로
    } catch (err) {
      alert('신고 접수에 실패했습니다.');
    }
  };

  return (
    <Container className="mt-5">
      <Card className="p-4">
        <Card.Title>신고하기</Card.Title>
        {submitted ? (
          <Alert variant="success">신고가 접수되었습니다.</Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="reason">
              <Form.Label>신고 사유를 입력해 주세요</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>
            <Button className="mt-3" type="submit" variant="danger">
              신고 제출
            </Button>
            <Button className="mt-3 ms-2" variant="secondary" onClick={() => navigate(-1)}>
              취소
            </Button>
          </Form>
        )}
      </Card>
    </Container>
  );
}

export default ReportForm;