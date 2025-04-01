import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';


function FAQPut() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const propsParam = useParams();
  const qa_id = propsParam.qa_id;

  const navigate = useNavigate();

  useEffect(() => {
    // 컴포넌트 마운트 시 FAQ 데이터 가져오기 (fetch 사용)
    fetch('http://localhost:8081/api/faqGetbyId/'+qa_id, { 
      method: 'GET',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('FAQ 데이터를 불러오는 데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            setQuestion(data.question);
            setAnswer(data.answer);
        })
        .catch(error => {
            console.error('FAQ 데이터를 불러오는 중 오류 발생:', error);
            alert('FAQ 데이터를 불러오는 중 오류가 발생했습니다.');
        });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:8081/api/faqPut/${qa_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, answer }),
    })
      .then((response) => {
        if (response.ok) {
          alert('FAQ가 성공적으로 수정되었습니다.');
          setQuestion(''); // 등록 후 입력필드 초기화
          setAnswer('');
          navigate('/FAQList');
        } else {
          alert('FAQ 수정에 실패했습니다.');
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
          <Form.Control type="text" value={question} onChange={(e) => setQuestion(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>답변</Form.Label>
          <Form.Control as="textarea" rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} required />
        </Form.Group>

        <Button variant="primary" type="submit">
          수정하기
        </Button>
      </Form>
    </div>
  );
}

export default FAQPut;