import React, { useEffect, useState } from "react";
import "./subscriptionState.css";
import { Button, Tag, Loader, Message, ButtonToolbar, Modal } from "rsuite";
import axiosInstance from "../pages/login/social/utils/axiosInstance";
import ReceiptModal from "./ReceiptModal";  // 영수증

function SubscriptionState({ goToPurchase }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const userUuid = localStorage.getItem("user_uuid");
        const res = await axiosInstance.get(`/api/purchase/${userUuid}`);
        console.log("🎫 구독 응답:", res.data);

        setSubscription(res.data);

        // 영수증 데이터도 미리 가져오기
        const receiptRes = await axiosInstance.get(`/api/purchase/receipt-data/${userUuid}`);
        setReceiptData(receiptRes.data);
      } catch (err) {
        console.error("❌ 구독 정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // 날짜 포맷 함수
  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 영수증 보기 버튼 클릭
  const handleOpenReceipt = () => {
    if (!receiptData) {
      alert("영수증 정보를 불러올 수 없습니다.");
      return;
    }
    setShowReceipt(true);
  };

  return (
    <div className="subscription-container">
      <div className="subscription-card">
        <h3 className="subscription-title">🎫 이용권 상태</h3>

        {loading ? (
          <Loader center content="로딩 중..." />
        ) : subscription ? (
          <>
            <div className="subscription-info">
              상태{subscription.active ? <Tag color="green">사용 중</Tag> : <Tag color="red">만료됨</Tag>}<br />
              구매일 {formatDate(subscription.startDate)}<br />
              만료일 {formatDate(subscription.endDate)}<br />
              이용권 종류 {subscription.subscriptionType}<br />
              남은 일수 {subscription.remainingDays}일<br />
              만료 여부 {subscription.expired ? "✔️ 만료됨" : "⏳ 이용 가능"}<br />
            </div>

            <ButtonToolbar className="subscription-toolbar">
              <Button appearance="primary" onClick={handleOpenReceipt} disabled={!receiptData}>
                🧾 영수증 보기
              </Button>
            </ButtonToolbar>

            {/* 항상 보여지는 안내 메시지 */}
            <Message type="warning" className="subscription-note">
              이용권 환불은 고객센터 또는 관리자에게 문의해주세요. <br />
              010-4682-4882 / anzngksduswn@naver.com
            </Message>
            {/* ✅ 모달 컴포넌트 */}
            <ReceiptModal
              open={showReceipt}
              onClose={() => setShowReceipt(false)}
              receiptData={receiptData}
            />
          </>
        ) : (
          <>
            <div className="subscription-empty">현재 이용 중인 이용권이 없습니다.</div>
            <Button appearance="primary" color="blue" onClick={goToPurchase}>
              👉 이용권 구매하러 가기
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default SubscriptionState;
