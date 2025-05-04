import React, { useEffect, useState, useCallback } from 'react';
import {
  Panel, Table, Button, Message, Loader, toaster, Input, Pagination
} from 'rsuite';
import axiosInstance from '../../login/social/utils/axiosInstance';
import './subscriptionManager.css';

const { Column, HeaderCell, Cell } = Table;

function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // ✅ 이용권 데이터 로딩 함수
  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/purchase/page', {
        params: { keyword, page, size: pageSize }
      });
      setSubscriptions(res.data.content);
      setTotal(res.data.totalElements);
    } catch (error) {
      console.error('❌ 이용권 목록 조회 실패:', error);
      toaster.push(<Message showIcon type="error">이용권 목록 조회 실패</Message>);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, pageSize]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // ✅ 환불 처리
  const handleRefund = async (impUid) => {
    try {
      const empId = localStorage.getItem('user_uuid');
      await axiosInstance.post(`/api/purchase/refund/${impUid}`, {
        empId
      });
      toaster.push(<Message showIcon type="success">환불 완료</Message>);
      fetchSubscriptions();
    } catch (error) {
      console.error('❌ 환불 실패:', error);
      toaster.push(<Message showIcon type="error">환불 처리 실패</Message>);
    }
  };

  // ✅ 검색 버튼 클릭
  const handleSearch = () => {
    setKeyword(searchKeyword); // 검색어 업데이트
    setPage(1); // 페이지 초기화
  };

  // ✅ 초기화 버튼 클릭
  const handleReset = () => {
    setSearchKeyword('');
    setKeyword('');
    setPage(1);
  };

  return (
    <div className="subscriptionManager-container">
      <Panel bordered header='💳 결제 상품 관리' className="subscriptionManager-card">
        {/* 🔍 검색 영역 */}
        <div className="subscriptionManager-search-bar">
          <Input
            placeholder="회원 이름으로 검색"
            value={searchKeyword}
            onChange={value => setSearchKeyword(value)}
            onPressEnter={handleSearch}
            style={{ width: 250, marginRight: 10 }}
          />
          <Button appearance="primary" onClick={handleSearch}>검색</Button>
          <Button appearance="ghost" onClick={handleReset} style={{ marginLeft: 8 }}>
            초기화
          </Button>
        </div>

        {loading ? (
          <Loader center content="로딩 중..." />
        ) : (
          <>
            <Table
              data={subscriptions}
              autoHeight
              bordered
              cellBordered
              rowHeight={50}
              wordWrap
            >
              <Column flexGrow={1} align="center">
                <HeaderCell>회원 이름</HeaderCell>
                <Cell dataKey="name" />
              </Column>

              <Column flexGrow={1} align="center">
                <HeaderCell>닉네임</HeaderCell>
                <Cell dataKey="nickname" />
              </Column>

              <Column flexGrow={1} align="center">
                <HeaderCell>이용권 상태</HeaderCell>
                <Cell>{row => row.active ? '✅ 사용 중' : '❌ 만료'}</Cell>
              </Column>

              <Column flexGrow={1} align="center">
                <HeaderCell>구매일</HeaderCell>
                <Cell>{row => new Date(row.startDate).toLocaleDateString()}</Cell>
              </Column>

              <Column flexGrow={1} align="center">
                <HeaderCell>만료일</HeaderCell>
                <Cell>{row => new Date(row.endDate).toLocaleDateString()}</Cell>
              </Column>

              <Column flexGrow={1} align="center">
                <HeaderCell>이용권 종류</HeaderCell>
                <Cell dataKey="subscriptionType" />
              </Column>

              <Column width={120} align="center" fixed="right">
                <HeaderCell>환불</HeaderCell>
                <Cell>
                  {row => (
                    <Button
                      size="sm"
                      color="red"
                      appearance="ghost"
                      disabled={!row.active}
                      onClick={() => handleRefund(row.transactionId)}
                    >
                      환불
                    </Button>
                  )}
                </Cell>
              </Column>
            </Table>

            {/* 📄 페이지네이션 */}
            <div className='subscriptionManager-rs-pagination'>
              <Pagination
                total={total}
                limit={pageSize}
                activePage={page}
                onChangePage={setPage}
              />
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

export default SubscriptionManager;
