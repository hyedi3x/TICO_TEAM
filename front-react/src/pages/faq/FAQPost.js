import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../login/social/utils/axiosInstance';
import './FAQPost.css';

function FAQPost({onClose}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [emp_email, setEmpEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      axiosInstance.get('/auth/user')
        .then((response) => {
          setEmpEmail(response.data?.email);
        })
        .catch((error) => {
          console.error('사용자 정보 조회 실패:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    axiosInstance.post('/api/faqPost', {
      question,
      answer,
      emp_email,
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response) => {
        if (response.status === 200) {
          alert('FAQ가 성공적으로 등록되었습니다.');
          setQuestion('');
          setAnswer('');
          
          const newFAQ = {
            qa_id: response.data.qa_id,  // 응답에서 받은 ID 사용
            question: question,
            answer: answer,
            emp_email: emp_email,
          };
  
          // 부모 컴포넌트에 새로운 FAQ 항목 전달
          onClose(newFAQ);
          
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
    <div className="faq-post-wrapper">
      <div className="faq-post-container">
        <div className="faq-post-header-box">
          <div className="faq-post-title">❓ FAQ 등록</div>
          <p className="faq-post-subtitle">작성자 : {emp_email}</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="faq-post-form-group">
            <Form.Label className="faq-post-label">질문</Form.Label>
            <Form.Control
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="faq-post-input"
              placeholder="예: 회원가입은 어떻게 하나요?"
            />
          </Form.Group>

          <Form.Group className="faq-post-form-group">
            <Form.Label className="faq-post-label">답변</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="faq-post-textarea"
              placeholder="예: 상단 메뉴에서 회원가입 버튼을 클릭하신 후, 정보를 입력해 주세요."
            />
          </Form.Group>

          <div className="faq-post-submit-wrapper">
            <Button type="submit" className="faq-post-submit">등록하기</Button>
            <Button type="button" onClick={onClose} className="faq-post-close">닫기</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default FAQPost;
