import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './FAQPut.module.css'; // 외부 CSS 모듈 추가
import axios from 'axios';

function FAQList() {
  const [faqData, setFaqData] = useState([]); // JSON 객체를 담을 배열
  const navigate = useNavigate();
  const modCheck = useRef(0); // 변경사항 확인

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/faqGet');
        const data = response.data;
        setFaqData(data);
      
      } catch (error) {
        console.error('FAQ 데이터를 불러오는 중 오류 발생:', error);
        alert('FAQ 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };
    fetchFaqData();
    modCheck.current = 0;
  }, []);

  // FAQ 수정용 핸들러
  const handleChange = (index, field, value) => {
    const updated = [...faqData]; // spread 연산자
    updated[index][field] = value; // 해당 객체의 key값을 변경
    setFaqData(updated);
    modCheck.current = 1;
  };

  // 삭제
  const deleteCheck = async (id) => {
    if (window.confirm(`정말 [${id}번] 항목을 삭제하시겠습니까?`)) {
      try {
        const response = await axios.delete(`http://localhost:8081/api/faqDelete/${id}`);
        if (response.status === 200) {
          alert('삭제되었습니다.');
          setFaqData((prev) => prev.filter((dto) => dto.qa_id !== id));
        } else {
          throw new Error('FAQ 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('FAQ 삭제 중 오류 발생:', error);
        alert('FAQ 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 개별수정
  const handleUpdate = async (qa_id, question, answer, index) => {
    if (!question.trim() || !answer.trim()) { // 공백을 지우고 유효검사
      alert('질문과 답변은 모두 입력해야 합니다.');
      return;
    }

    const confirmed = window.confirm(`${qa_id}번 FAQ를 수정하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await axios.put(`http://localhost:8081/api/faqPut/${qa_id}`, {
        question,
        answer
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    
      // 상태만 갱신해서 리렌더링
      setFaqData((prev) =>
        prev.map((item) =>
          item.qa_id === qa_id ? { ...item, question, answer } : item
        )
      );
    
      if (response.status !== 200) throw new Error('FAQ 수정 실패');
      alert(`FAQ ${qa_id}번 항목이 성공적으로 수정되었습니다.`);
    } catch (error) {
      console.error('FAQ 수정 중 오류:', error);
      alert(`FAQ ${qa_id} 수정 중 오류가 발생했습니다.`);
    }
  };

  // 등록화면으로 넘어가기
  const postChek = () => {
    if (modCheck.current === 1) {
      if (window.confirm("변경사항이 있습니다. 등록하기 화면으로 넘어가시겠습니까?")) {
        navigate('/faqpost');
      } else return false;
    } else navigate('/faqpost');
  };

  return (
    <div className={styles.f_container}>
      <h2 className={styles.f_title}>자주 묻는 질문 (FAQ)</h2>
      <p className={styles.f_subtitle}>수정 / 삭제</p>

      {/* overflowY: auto는 내부 내용이 넘치면 자동으로 세로 스크롤이 생기게 함 */}
      <div className={styles["f_scroll-box"]}>
        {faqData.map((dto, index) => (
          <Card key={dto.qa_id} className={styles.f_card}>
            <Card.Body>
              <Row className={styles.f_row}>
                <Col>
                  <b>{index + 1}.</b>
                  <Form.Control
                    type="text"
                    value={dto.question}
                    onChange={(e) => handleChange(index, 'question', e.target.value)}
                    placeholder="질문을 입력하세요"
                    className={styles.f_input}
                  />
                </Col>
                <Col xs="auto">
                  <Button variant="warning" size="sm" onClick={() => handleUpdate(dto.qa_id, dto.question, dto.answer, index)}>
                    수정
                  </Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-danger" size="sm" onClick={() => deleteCheck(dto.qa_id)}>
                    ❌
                  </Button>
                </Col>
              </Row>
              <Form.Control
                as="textarea"
                rows={3}
                value={dto.answer}
                onChange={(e) => handleChange(index, 'answer', e.target.value)}
                placeholder="답변을 입력하세요"
                className={styles.f_textarea}
              />
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className={styles["f_button-wrapper"]}>
        <Button variant="primary" size="lg" onClick={() => postChek()} className={["styles.f_register-btn"]}>
          FAQ 새로 등록하기
        </Button>
      </div>
    </div>
  );
}

export default FAQList;
