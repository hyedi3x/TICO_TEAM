import React, { useState, useEffect, useRef } from 'react';
import { Button, Form } from 'react-bootstrap'; // 기본 버튼과 폼만 사용
import { Modal } from 'rsuite';
import { useNavigate } from 'react-router-dom';
import './FAQPut.css'; // 외부 CSS 모듈 추가
import axiosInstance from '../login/social/utils/axiosInstance';
import FAQPost from './FAQPost';

function FAQList() {
  const [faqData, setFaqData] = useState([]); // JSON 객체를 담을 배열
  const navigate = useNavigate();
  const modCheck = useRef(0); // 변경사항 확인
  const [modify_email, setModify_email] = useState(''); // 수정자 이메일 
  const [showPostModal, setShowPostModal] = useState(false);

  // 사용자 정보 조회
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      axiosInstance.get('/auth/user')
        .then((response) => {
          setModify_email(response.data?.email);
        })
        .catch((error) => {
          console.error('사용자 정보 조회 실패:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        });
    }
  }, []);

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

  const handleUpdate = async (qa_id, question, answer, emp_email, index) => {
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
        emp_email,
        modify_email : modify_email,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    
      setFaqData((prev) =>
        prev.map((item) =>
          item.qa_id === qa_id
            ? { ...item, question, answer, modify_email: modify_email }
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

  const openFAQPostModal = () => {
    setShowPostModal(true);
  };

  const handleAddFAQ = (newFAQ) => {
    setFaqData((prev) => [...prev, newFAQ]); // 새로운 FAQ 항목 추가
  };

  return (
    <div className="faq-wrapper">
      <div className="faq-container">
        <div className="faq-header-box">
          <span className="faq-title">❓ 자주 묻는 질문 (FAQ)</span>
          <Button className="faq-btn add-button" onClick={openFAQPostModal}>FAQ 등록</Button>
        </div>

        <div className="faq-list">
          {faqData.map((dto, index) => (
            <div key={dto.qa_id} className="faq-item">
              <div className="faq-header">
                <span className="faq-index">{index + 1}번 항목</span>
                <div className="faq-buttons">
                  <span className="faq-writer">
                    작성자: {dto.emp_email} / 최종수정자: {dto.modify_email || '-'}
                  </span>
                  <Button
                    className="faq-btn btn-edit"
                    size="sm"
                    onClick={() => handleUpdate(dto.qa_id, dto.question, dto.answer, dto.emp_id, index)}
                  >
                    수정
                  </Button>
                  <Button
                    className="faq-btn btn-delete"
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
                className="faq-input"
              />
  
              <Form.Control
                as="textarea"
                rows={3}
                value={dto.answer}
                onChange={(e) => handleChange(index, 'answer', e.target.value)}
                placeholder="답변을 입력하세요"
                className="faq-textarea"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 등록하기 모달 배경눌러도 안닫힘 */}
      <Modal open={showPostModal} onClose={() => setShowPostModal(false)}
       size="md" backdrop="static" style={{ marginTop: '50px' }}
       className="no-padding-modal"> 
        <Modal.Body className="no-padding-body">
          <FAQPost onClose={(newFAQ) => { setShowPostModal(false); handleAddFAQ(newFAQ); }} />
        </Modal.Body>
      </Modal>

    </div>
  );
  
}

export default FAQList;
