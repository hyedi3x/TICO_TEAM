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

    const deleteCheck = async (id) => {
        if (window.confirm(`정말 [${id}번] 항목을 삭제하시겠습니까?`)) {
            try {
                const response = await fetch(`http://localhost:8081/api/faqDelete/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('FAQ 삭제에 실패했습니다.');
                }
                alert('삭제되었습니다.');
                // 삭제 성공 시 재렌더링을 위한 상태 업데이트
                setFaqData((prevData) => prevData.filter((dto) => dto.qa_id !== id));
            } catch (error) {
                console.error('FAQ 삭제 중 오류 발생:', error);
                alert('FAQ 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="container mt-4">
            {faqData.map((dto) => (
                <Accordion key={dto.qa_id}>
                    <Accordion.Item eventKey={dto.qa_id}>
                        <Accordion.Header>
                            {dto.qa_id}. {dto.question}
                        </Accordion.Header>
                        <Accordion.Body>
                            {dto.answer}
                            <div>
                                <p> - 관리자 메뉴 - </p>
                                <Button variant="primary" size="sm" onClick={() => navigate(`/FAQPut/${dto.qa_id}`)}>수정</Button>
                                <Button variant="secondary" size="sm" onClick={() => deleteCheck(dto.qa_id)}>삭제</Button>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            ))}
        </div>
    );
}

export default FAQList;