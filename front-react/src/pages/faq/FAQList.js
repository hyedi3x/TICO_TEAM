import React, { useState, useEffect } from 'react';
import { Accordion } from 'react-bootstrap';
import styles from './FAQList.module.css';
import axiosInstance from '../login/social/utils/axiosInstance';

function FAQList() {
  // 전체 FAQ 데이터 상태
  const [faqData, setFaqData] = useState([]);
  
  // 현재 보고 있는 페이지
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지당 보여줄 항목 수
  const itemsPerPage = 10;

  // 한 번에 보여줄 페이지 번호 수 (5개씩 묶음)
  const pagesPerGroup = 5;

  // FAQ 데이터 가져오기
  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await axiosInstance.get('/api/faqGet');
        setFaqData(response.data);
      } catch (error) {
        console.error('FAQ 데이터를 불러오는 중 오류:', error);
      }
    };

    fetchFaqData();
  }, []);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(faqData.length / itemsPerPage);

  // 현재 페이지에 보여줄 항목 범위 계산
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = faqData.slice(startIdx, startIdx + itemsPerPage);

  // 현재 페이지 그룹 계산 (0부터 시작)
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const startPage = currentGroup * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  // 페이지 번호 배열
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.f_container}>
      <h2 className={styles.f_title}>📋 자주 묻는 질문 (FAQ)</h2>

      {/* FAQ 아코디언 */}
      <Accordion alwaysOpen className={styles.f_accordion}>
        {currentItems.map((dto, index) => (
          <Accordion.Item key={dto.qa_id} eventKey={dto.qa_id} className={styles.f_item}>
            <Accordion.Header>
              {startIdx + index + 1}. {dto.question}
            </Accordion.Header>
            <Accordion.Body>{dto.answer}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* 페이지네이션 */}
      <div className={styles.f_pagination}>
      {/* 항상 보이게 하고 disabled 처리 */}
        <button
          onClick={() => setCurrentPage(startPage - 1)}
          className={`${styles.f_pageBtn} ${startPage === 1 ? styles.disabled : ''}`}
          disabled={startPage === 1}
        >
          ❮
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`${styles.f_pageBtn} ${currentPage === page ? styles.active : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(endPage + 1)}
          className={`${styles.f_pageBtn} ${endPage >= totalPages ? styles.disabled : ''}`}
          disabled={endPage >= totalPages}
        >
          ❯
        </button>
      </div>
    </div>
  );
}

export default FAQList;
