import React, { useState, useEffect } from 'react';
import { Accordion } from 'react-bootstrap';
import styles from './FAQList.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function FAQList() {
  const [faqData, setFaqData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/faqGet');
      
        // 응답 데이터 추출
        const data = response.data;
        setFaqData(data);
      
      } catch (error) {
        console.error('FAQ 데이터를 불러오는 중 오류 발생:', error);
        alert('FAQ 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchFaqData();
  }, []);

  return (
    <div className={styles.f_container}>
      <h2 className="f_title">자주 묻는 질문 (FAQ)</h2>

      <Accordion alwaysOpen className={styles.f_accordion}>
        {faqData.map((dto, index) => (
          <Accordion.Item
            key={dto.qa_id}
            eventKey={dto.qa_id}
            className={styles["f_accordion-item"]}
          >
            <Accordion.Header className={styles["f_accordion-header"]}>
              {index + 1}. {dto.question}
            </Accordion.Header>

            <Accordion.Body className={styles["f_accordion-body"]}>
              {dto.answer}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

export default FAQList;
