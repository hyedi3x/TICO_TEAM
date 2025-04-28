import React, { useEffect, useState, useCallback } from 'react';
import { Table, Panel, Loader, Input, Button, Pagination, Message, toaster } from 'rsuite';
import axiosInstance from '../../login/social/utils/axiosInstance';
import './purchaseLogPage.css'; // 📄 css 분리해서 관리

const { Column, HeaderCell, Cell } = Table;

function PurchaseLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 결제 로그 가져오기
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/purchase/logs', {
        params: { keyword, page, size: pageSize }
      });
      setLogs(res.data.content);
      setTotal(res.data.totalElements);
    } catch (err) {
      console.error('❌ 결제 로그 불러오기 실패:', err);
      toaster.push(<Message showIcon type="error">결제 로그 불러오기 실패</Message>);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 검색
  const handleSearch = () => {
    setKeyword(searchKeyword);
    setPage(1);
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchKeyword('');
    setKeyword('');
    setPage(1);
  };

  // 엑셀 다운로드
  const handleDownloadExcel = async () => {
    try {
      const res = await axiosInstance.get('/api/purchase/logs/download', {
        responseType: 'blob' // 🔥 이거 중요: 파일 받을 땐 blob으로 설정
      });

      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'purchase_logs.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ 엑셀 다운로드 실패:', error);
      toaster.push(<Message showIcon type="error">엑셀 다운로드 실패</Message>);
    }
  };

  return (
    <div className="purchaseLog-container">
      <Panel bordered header="📋 결제 로그 목록" className="purchaseLog-card">


        {/* 🔍 검색 영역 */}
        <div className="purchaseLog-search-bar">
          <Input
            placeholder="회원 이름 또는 관리자 이름 검색"
            value={searchKeyword}
            onChange={value => setSearchKeyword(value)}
            onPressEnter={handleSearch}
            style={{ width: 250, marginRight: 10 }}
          />
          <Button appearance="primary" onClick={handleSearch}>검색</Button>
          <Button appearance="ghost" onClick={handleReset} style={{ marginLeft: 8 }}>
            초기화
          </Button>

          <Button appearance="primary" color="green" onClick={handleDownloadExcel} style={{ marginLeft: 8 }} >
            📥 엑셀 다운로드
          </Button>
        </div>

        {loading ? (
          <Loader center content="로딩 중..." />
        ) : (
          <>
            <Table
              data={logs}
              autoHeight
              bordered
              cellBordered
              rowHeight={60}
              wordWrap
            >
              <Column flexGrow={1}>
                <HeaderCell>회원 이름</HeaderCell>
                <Cell dataKey="userName" />
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>결제일</HeaderCell>
                <Cell>{row => row.paymentCompletedAt ? new Date(row.paymentCompletedAt).toLocaleString() : "-"}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>이용권</HeaderCell>
                <Cell dataKey="productName" />
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>결제수단</HeaderCell>
                <Cell>{row => `${row.payMethod} (${row.paymentGateway})`}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>결제금액</HeaderCell>
                <Cell>{row => `₩${row.amount.toLocaleString()}`}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>상태</HeaderCell>
                <Cell>{row => row.status === "REFUNDED" ? "❌ 환불됨" : "✅ 결제완료"}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>환불일</HeaderCell>
                <Cell>{row => row.refundedAt ? new Date(row.refundedAt).toLocaleString() : "-"}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>관리자 이름</HeaderCell>
                <Cell>{row => row.empName || "-"}</Cell>
              </Column>
            </Table>

            {/* 📄 페이지네이션 */}
            <div className="purchaseLog-pagination">
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

export default PurchaseLogPage;