import React from "react";
import { Modal, Button } from "rsuite";
import "./receiptModal.css";

function ReceiptModal({ open, onClose, receiptData }) {
  if (!receiptData) return null;

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" className="receipt-modern-modal">
      <Modal.Header>
        <Modal.Title>구매 영수증</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="receipt-modern-container">
          {/* 주문 정보 */}
          <div className="receipt-section">
            <h5>주문 정보</h5>
            <div className="receipt-row">
              <strong>주문번호</strong>
              <span>{receiptData.orderId || receiptData.transactionId || '-'}</span>
            </div>
            <div className="receipt-row">
              <strong>거래일시</strong>
              <span>{formatDate(receiptData.paymentDate)}</span>
            </div>
            <div className="receipt-row"><strong>상품명</strong><span>{receiptData.productName || "프리미엄 이용권"}</span></div>
          </div>

          {/* 판매자 정보 */}
          <div className="receipt-section">
            <h5>판매자 정보</h5>
            <div className="receipt-row"><strong>상호명</strong><span>TICO 플랫폼</span></div>
            <div className="receipt-row"><strong>사업자등록번호</strong><span>000-00-00000</span></div>
            <div className="receipt-row"><strong>전화번호</strong><span>010-4682-4882</span></div>
            <div className="receipt-row"><strong>주소</strong><span>서울특별시 영등포구 여의도동</span></div>
          </div>

          {/* 금액 정보 */}
          <div className="receipt-section">
            <h5>결제 금액</h5>
            <div className="receipt-row"><strong>승인금액</strong><span>₩{receiptData.amount?.toLocaleString()}</span></div>
            <div className="receipt-row"><strong>공급가액</strong><span>₩{(receiptData.amount * 10 / 11)?.toLocaleString()}</span></div>
            <div className="receipt-row"><strong>부가세</strong><span>₩{(receiptData.amount / 11)?.toLocaleString()}</span></div>
            <div className="receipt-row"><strong>봉사료</strong><span>₩0</span></div>
          </div>

          {/* 합계 */}
          <div className="receipt-total">
            합계: <span className="total-amount">₩{receiptData.amount?.toLocaleString()}</span>
          </div>

          {/* 인쇄 버튼 */}
          <div className="receipt-button-wrapper">
            <Button appearance="primary" color="green" onClick={handlePrint}>인쇄하기</Button>
          </div>

          {/* 안내 문구 */}
          <div className="receipt-footer-note">
            ※ 본 영수증은 세금계산서 대용으로 사용할 수 없습니다.
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ReceiptModal;