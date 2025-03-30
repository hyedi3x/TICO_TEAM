import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


function FAQPost() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8081/api/faqPost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, answer }),
    })
      .then((response) => {
        if (response.ok) {
          alert('FAQ가 성공적으로 등록되었습니다.');
          setQuestion(''); // 등록 후 입력필드 초기화
          setAnswer('');
          navigate('/FAQList');
        } else {
          alert('FAQ 등록에 실패했습니다.');
        }
      })
      .catch((error) => {
        console.error('오류 발생:', error);
        alert('오류가 발생했습니다.');
      });
  };

  return (
    <div className="container mt-4">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>질문</Form.Label>
          <Form.Control type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>답변</Form.Label>
          <Form.Control as="textarea" rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </Form.Group>

        <Button variant="primary" type="submit">
          등록
        </Button>
      </Form>
    </div>
  );
}

export default FAQPost;