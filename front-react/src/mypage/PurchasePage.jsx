import React, { useEffect, useState } from 'react';
import './purchasePage.css';
import { Button, Panel, Message } from 'rsuite';
import axiosInstance from '../pages/login/social/utils/axiosInstance';

function PurchasePage({ goToStatus }) {
  const userUuid = localStorage.getItem('user_uuid');

  const [isPaying, setIsPaying] = useState(false);
  const [status, setStatus] = useState('IDLE');   // PAID / FAILED / IDLE
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // 아임포트 초기화는 최초 렌더링 시 한 번만(v1방식)
  useEffect(() => {
    if (window.IMP) {
      window.IMP.init(process.env.REACT_APP_IMP_CODE);
    } else {
      console.error('❌ 아임포트 객체가 존재하지 않습니다.');
    }
  }, []);

  // 이미 이용권이 있는지 확인
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await axiosInstance.get(`/api/purchase/${userUuid}`);
        if (res.data?.active) {
          setAlreadySubscribed(true);
        }
      } catch (err) {
        console.warn("구독 정보 없음 또는 오류:", err);
      } finally {
        setLoadingSubscription(false);
      }
    };
    checkSubscription();
  }, [userUuid]);

  const handlePayment = () => {
    const IMP = window.IMP;
    if (!IMP) {
      alert('❌ 결제 모듈 로딩 실패. 새로고침 후 다시 시도해주세요.');
      return;
    }

    setIsPaying(true);

    IMP.request_pay({
      pg: "kakaopay.TC0ONETIME",
      pay_method: "card",
      name: "프리미엄 이용권",
      amount: 5000,
    }, async (rsp) => {
      if (rsp.success) {
        try {
          const response = await axiosInstance.post(`/api/purchase/verify/${rsp.imp_uid}`, {
            userUuid,
            subscriptionType: "premium",
            productName: "프리미엄 이용권",
            durationDays: 30
          });
          console.log("✅ 결제 완료:", response.data);
          alert("✅ 결제 및 이용권 등록 성공!");
          setStatus("PAID");
          setAlreadySubscribed(true); // UI 업데이트
          if (goToStatus) {
            goToStatus();
          }
        } catch (error) {
          console.error("❌ 서버 검증 실패:", error);
          const message = error.response?.data || "결제 후 검증 중 오류가 발생했습니다.";
          alert(`❌ ${message}`);
          setStatus("FAILED");
        }
      } else {
        alert(`❌ 결제 실패: ${rsp.error_msg}`);
        setStatus("FAILED");
      }

      setIsPaying(false);
    });
  };

  if (loadingSubscription) {
    return <div className="purchase-container"><Message>⏳ 로딩 중...</Message></div>;
  }

  return (
    <div className="purchase-container">
      <Panel header="이용권 구매" bordered className="purchase-panel">
        <div className="purchase-description">
          프리미엄 오브젝트를 사용하려면 이용권이 필요합니다.<br />
          이용권을 구매하면 모든 유료 오브젝트를 자유롭게 사용할 수 있습니다.
        </div>

        <div className="purchase-options">
          <div className="option-box">
            <h4>프리미엄 이용권</h4>
            <p>1개월 무제한 사용</p>
            <p className="price">₩5,000</p>

            {alreadySubscribed ? (
              <Button appearance="primary" color="green" onClick={goToStatus}>
                🎟 이용권 상태 보러가기
              </Button>
            ) : (
              <Button appearance="primary" onClick={handlePayment} disabled={isPaying}>
                {isPaying ? "결제 중..." : "카카오 페이로 구매하기"}
              </Button>
            )}
          </div>
        </div>

        {status === 'PAID' && (
          <Message type="success" className="purchase-note">
            결제 완료! 프리미엄 이용권이 활성화되었습니다.
          </Message>
        )}

        {status === 'FAILED' && (
          <Message type="error" className="purchase-note">
            결제에 실패했습니다. 다시 시도해주세요.
          </Message>
        )}

        {status === 'IDLE' && !alreadySubscribed && (
          <Message type="info" className="purchase-note">
            구매 후에는 마이페이지에서 이용권 사용 내역을 확인할 수 있습니다.
          </Message>
        )}
      </Panel>
    </div>
  );
}

export default PurchasePage;
