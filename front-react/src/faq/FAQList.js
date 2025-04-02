import React, { useState, useEffect } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function FAQList() {
    const [faqData, setFaqData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // FAQ 데이터를 가져오는 함수
        const fetchFaqData = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/faqGet', { method: 'GET' });
                if (!response.ok) {
                    throw new Error('FAQ 데이터를 불러오는 데 실패했습니다.');
                }
                const data = await response.json();
                setFaqData(data);
            } catch (error) {
                console.error('FAQ 데이터를 불러오는 중 오류 발생:', error);
                alert('FAQ 데이터를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchFaqData();
    }, []);
    return (
        <div className="container mt-5">
          <h2 className="text-center mb-5 fw-bold">자주 묻는 질문 (FAQ)</h2>

          <Accordion alwaysOpen  style={{ marginTop: '20px' }}>
            {faqData.map((dto,index) => (
              <Accordion.Item
              key={dto.qa_id}
              eventKey={dto.qa_id}
              style={{
                marginBottom: '15px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                overflow: 'hidden', // 내부 둥글게 잘리도록 설정
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Accordion.Header
                style={{
                  fontWeight: 'bold',
                  backgroundColor: '#fff',
                }}
              >
                {index+1}. {dto.question}
              </Accordion.Header>
            
              <Accordion.Body
                style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  backgroundColor: '#f9f9f9',
                  padding: '20px',
                }}
              >
                {dto.answer}
              </Accordion.Body>
            </Accordion.Item>
            ))}
          </Accordion>

          <div className="text-center my-5">
            <Button
              variant="success"
              size="lg"
              onClick={() => navigate('/faqpost')}
              style={{
                padding: '12px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0, 128, 0, 0.2)',
              }}
            >
                FAQ 등록하기
            </Button>
          </div>
        </div>
    );
}

export default FAQList;