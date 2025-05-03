import React, { useEffect, useState } from 'react';
import { Panel, Message, Loader, toaster, Pagination, Input, Modal, Button } from 'rsuite';
import axiosInstance from '../../login/social/utils/axiosInstance';
import './projectReportList.css';

function ProjectReportList() {
  // 🔄 상태 정의
  const [reports, setReports] = useState([]);              // 신고 목록
  const [loading, setLoading] = useState(true);            // 로딩 여부
  const [page, setPage] = useState(1);                     // 현재 페이지
  const [pageSize] = useState(10);                         // 한 페이지당 항목 수
  const [total, setTotal] = useState(0);                   // 전체 항목 수
  const [searchKeyword, setSearchKeyword] = useState('');  // 검색어
  const [selectedReport, setSelectedReport] = useState(null); // 선택된 신고 항목
  const [showModal, setShowModal] = useState(false);       // 모달 표시 여부

  // 🚨 신고 목록 API 호출
  const loadReports = (keyword = '', targetPage = 1) => {
    setLoading(true);
    axiosInstance
      .get('/api/report/list', {
        params: {
          keyword,
          page: targetPage,
          size: pageSize,
        },
      })
      .then((res) => {
        setReports(res.data.content);        // 신고 목록 저장
        setTotal(res.data.totalElements);    // 전체 개수 저장
      })
      .catch((err) => {
        console.error('신고 목록 불러오기 실패:', err);
        toaster.push(
          <Message type="error" showIcon>신고 목록 불러오기 실패</Message>,
          { placement: 'topEnd' }
        );
      })
      .finally(() => setLoading(false));
  };

  // 🔔 알림 전송 API 호출
  const sendNotificationFromReport = async (reportId) => {
    try {
      await axiosInstance.post(`/api/user-notification/send-from-report/${reportId}`);
      toaster.push(
        <Message type="success" showIcon>알림이 성공적으로 전송되었습니다.</Message>,
        { placement: 'topEnd' }
      );
    } catch (err) {
      console.error('알림 전송 실패:', err);
      toaster.push(
        <Message type="error" showIcon>알림 전송에 실패했습니다.</Message>,
        { placement: 'topEnd' }
      );
    }
  };

  // 🔍 검색 버튼 클릭 시
  const handleSearch = () => {
    setPage(1);
    loadReports(searchKeyword, 1);
  };

  // 🔁 초기화 버튼 클릭 시
  const handleReset = () => {
    setSearchKeyword('');
    setPage(1);
    loadReports('', 1);
  };

  // 📄 페이지 변경 시
  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    loadReports(searchKeyword, nextPage);
  };

  // 📦 최초 로딩 시 신고 목록 호출
  useEffect(() => {
    loadReports('', 1);
  }, []);

  // ⏳ 로딩 중이면 스피너 표시
  if (loading) return <Loader center content="로딩 중..." />;

  return (
    <div className="ProjectReportList-container">

      {/* 📋 신고 상세보기 모달 */}
      <Modal open={showModal} onClose={() => setShowModal(false)} size="sm">
        <Modal.Header>
          <Modal.Title>신고 상세 내용</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <p><strong>신고자:</strong> {selectedReport.user?.name} ({selectedReport.user?.nickname})</p>
              <p><strong>작품 ID:</strong> {selectedReport.projectId}</p>
              <p><strong>신고 일시:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
              <p><strong>신고 사유:</strong></p>
              <div className="ProjectReportList-reason-box">{selectedReport.reason}</div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)} appearance="primary">닫기</Button>
        </Modal.Footer>
      </Modal>

      {/* 🧾 신고 목록 테이블 */}
      <Panel bordered shaded className="ProjectReportList-card" header="🚨 작품 신고 목록">
        {/* 🔍 검색창 */}
        <div className="ProjectReportList-search-bar">
          <Input
            placeholder="신고자 이름 또는 UUID 검색..."
            value={searchKeyword}
            onChange={setSearchKeyword}
            onPressEnter={handleSearch}
            style={{ width: 300, marginRight: 8 }}
          />
          <button onClick={handleSearch} className="ProjectReportList-search-button">검색</button>
          <button onClick={handleReset} className="ProjectReportList-reset-button">초기화</button>
        </div>

        {/* 📑 테이블 영역 */}
        <div className="ProjectReportList-table-wrapper">
          <table className="ProjectReportList-table">
            <thead>
              <tr>
                <th>신고자</th>
                <th>닉네임</th>
                <th>작품 ID</th>
                <th>신고 사유</th>
                <th>신고 일시</th>
                <th>상세</th>
                <th>알림</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.reportId}>
                  <td>{report.user?.name ?? '알 수 없음'}</td>
                  <td>{report.user?.nickname ?? 'unknown'}</td>
                  <td>{report.projectId}</td>
                  <td>{report.reason}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="ProjectReportList-detail-button"
                      onClick={() => {
                        setShowModal(true);              // 모달 열기
                        setSelectedReport(report);       // 상세보기용 선택된 신고 설정
                      }}
                    >
                      상세보기
                    </button>
                  </td>
                  <td>
                    <button
                      className="ProjectReportList-alert-button"
                      onClick={() => sendNotificationFromReport(report.reportId)}
                    >
                      알림 보내기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📄 페이지네이션 */}
        <div className="ProjectReportList-pagination-wrapper">
          <Pagination
            total={total}
            limit={pageSize}
            activePage={page}
            onChangePage={handlePageChange}
            size="sm"
          />
        </div>
      </Panel>
    </div>
  );
}

export default ProjectReportList;
