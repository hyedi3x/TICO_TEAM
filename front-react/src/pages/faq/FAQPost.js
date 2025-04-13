import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './FAQPost.module.css'; // 외부 CSS 모듈 추가

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
  <div className={styles.f_container}>
    <div className={styles.f_row}>
      <div className={styles.f_col}>
        <div className={styles.f_card}>
          <h2 className={styles.f_title}>FAQ 등록</h2>
          <p className={styles.f_subtitle}>자주 묻는 질문과 답변을 입력해주세요.</p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className={styles["f_form-group"]}>
              <Form.Label className={styles.f_label}>질문</Form.Label>
              <Form.Control 
                type="text" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                required 
                placeholder="예: 회원가입은 어떻게 하나요?" 
              />
            </Form.Group>

            <Form.Group className={styles["f_form-group"]}>
              <Form.Label className={styles.f_label}>답변</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                required 
                placeholder="예: 상단 메뉴에서 회원가입 버튼을 클릭하신 후, 정보를 입력해 주세요." 
              />
            </Form.Group>

            <div className={styles["f_btn-wrapper"]}>
              <Button variant="success" type="submit" size="lg">
                등록하기
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
);
}

export default FAQPost;