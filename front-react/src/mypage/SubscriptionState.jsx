import React, { useEffect, useState } from "react";
import "./subscriptionState.css";
import { Button, Tag, Loader, Message, ButtonToolbar } from "rsuite";
import axiosInstance from "../pages/login/social/utils/axiosInstance";
import ReceiptModal from "./ReceiptModal";

function SubscriptionState({ goToPurchase }) {
  const [subscription, setSubscription] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const userUuid = localStorage.getItem("user_uuid");

      // ✅ 1. 이용권 정보 요청
      const res = await axiosInstance.get(`/api/purchase/${userUuid}`);
      setSubscription(res.data);

      // ✅ 2. 영수증 정보 요청 (404 예외만 따로 처리)
      try {
        const receiptRes = await axiosInstance.get(`/api/purchase/receipt-data/${userUuid}`);
        setReceiptData(receiptRes.data);
      } catch (receiptErr) {
        if (receiptErr.response?.status === 404) {
          console.log("ℹ️ 영수증 없음 (최근 결제 기록 없음)");
        } else {
          console.error("❌ 영수증 조회 실패:", receiptErr);
        }
        setReceiptData(null); // 명시적으로 null 처리
      }

    } catch (err) {
      console.error("❌ 이용권 정보 조회 실패:", err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

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
              상태 {subscription.active ? (
                <Tag color="green">사용 중</Tag>
              ) : (
                <Tag color="red">만료됨</Tag>
              )}<br />
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

            <Message type="warning" className="subscription-note">
              이용권 환불은 고객센터 또는 관리자에게 문의해주세요. <br />
              010-1111-2222 / tico@hotmail.com
            </Message>

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
