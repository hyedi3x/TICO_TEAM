import React, { useState, useEffect, useRef } from 'react';
import { Button, Form } from 'react-bootstrap'; // 기본 버튼과 폼만 사용
import { useNavigate } from 'react-router-dom';
import styles from './FAQPut.module.css'; // 외부 CSS 모듈 추가
import axiosInstance from '../login/social/utils/axiosInstance';

function FAQList() {
  const [faqData, setFaqData] = useState([]); // JSON 객체를 담을 배열
  const navigate = useNavigate();
  const modCheck = useRef(0); // 변경사항 확인
  const modify_id = localStorage.getItem("user_uuid");

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await axiosInstance.get('/api/faqGet');
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

  const handleChange = (index, field, value) => {
    const updated = [...faqData];
    updated[index][field] = value;
    setFaqData(updated);
    modCheck.current = 1;
  };

  const deleteCheck = async (id) => {
    if (window.confirm(`정말 삭제하시겠습니까? (복구 불가)`)) {
      try {
        const response = await axiosInstance.delete(`/api/faqDelete/${id}`);
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

  const handleUpdate = async (qa_id, question, answer, emp_id, index) => {
    if (!question.trim() || !answer.trim()) {
      alert('질문과 답변은 모두 입력해야 합니다.');
      return;
    }

    const confirmed = window.confirm(`${index+1}번 FAQ를 수정하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await axiosInstance.put(`/api/faqPut/${qa_id}`, {
        question,
        answer,
        emp_id,
        modify_id : modify_id,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    
      setFaqData((prev) =>
        prev.map((item) =>
          item.qa_id === qa_id
            ? { ...item, question, answer, modify_id: modify_id }
            : item
        )
      );
    
      if (response.status !== 200) throw new Error('FAQ 수정 실패');
      alert(`FAQ ${index+1}번 항목이 성공적으로 수정되었습니다.`);
    } catch (error) {
      console.error('FAQ 수정 중 오류:', error);
      alert(`FAQ ${index+1} 수정 중 오류가 발생했습니다.`);
    }
  };

  const postChek = () => {
    if (modCheck.current === 1) {
      if (window.confirm("변경사항이 있습니다. 등록하기 화면으로 넘어가시겠습니까?")) {
        navigate('/faqpost');
      } else return false;
    } else navigate('/faqpost');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>자주 묻는 질문 (FAQ)</h2>
      <p className={styles.subtitle}>수정 / 삭제</p>

      <div className={styles.faqList}>
        {faqData.map((dto, index) => (
          <div key={dto.qa_id} className={styles.faqItem}>
            <div className={styles.faqHeader}>
              <span className={styles.faqIndex}>{index + 1}번 항목</span>
          
              <div className={styles.faqButtons}>
                작성자: {dto.emp_id} / 최종수정자: {dto.modify_id || '-'}
                <Button
                  className={styles.editButton}
                  size="sm"
                  onClick={() => handleUpdate(dto.qa_id, dto.question, dto.answer, dto.emp_id, index)}
                >
                  수정
                </Button>
          
                <Button
                  className={styles.deleteButton}
                  size="sm"
                  onClick={() => deleteCheck(dto.qa_id)}
                >
                  삭제
                </Button>
              </div>
            </div>
          
            <Form.Control
              type="text"
              value={dto.question}
              onChange={(e) => handleChange(index, 'question', e.target.value)}
              placeholder="질문을 입력하세요"
              className={styles.faqInput}
            />
          
            <Form.Control
              as="textarea"
              rows={3}
              value={dto.answer}
              onChange={(e) => handleChange(index, 'answer', e.target.value)}
              placeholder="답변을 입력하세요"
              className={styles.faqTextarea}
            />
          </div>
        ))}
      </div>

      <div className={styles.addButtonWrapper}>
        <Button
          className={styles.addButton}
          size="lg"
          onClick={() => postChek()}
        >
          FAQ 새로 등록하기
        </Button>
      </div>
    </div>
  );
}

export default FAQList;
