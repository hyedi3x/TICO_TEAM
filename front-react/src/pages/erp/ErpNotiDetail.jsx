import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './erpNotiDetail.css';

function ErpNotiDetail({ id, onBack, onEdit }) {
    // 공지사항 데이터를 담을 상태 변수
    const [notice, setNotice] = useState(null);

    // 공지사항 ID가 변경될 때마다 상세 데이터 요청
    useEffect(() => {
        if (id) {   // id가 null 또는 undefined가 아니면 실행
            axios.get(`http://localhost:8081/api/notices/notice/${id}`)    // GET 요청으로 해당 ID의 공지사항 조회
                .then(response => setNotice(response.data))         // 데이터 수신 → 상태 업데이트
                .catch(error => console.error('Error loading detail:', error));
        }
    }, [id]);   // 의존성 배열 : id가 변경될 때마다 실행

    // 데이터가 아직 로드되지 않았을 때 로딩 문구 표시
    if (!notice) return <div className="notice-detail-container">로딩 중...</div>;

    return (
        <div className="notice-detail-container">
            <h3>공지사항 상세</h3>

            {/* 공지사항 기본 정보 테이블 */}
            <table className="notice-detail-table">
                <tbody>
                    <tr>
                        <th>제목</th>
                        <td>{notice.erpNotiTitle}</td>
                    </tr>
                    <tr>
                        <th>작성자</th>
                        <td>{notice.empId}</td>
                    </tr>
                    <tr>
                        <th>유형</th>
                        <td>{notice.erpNotiType}</td>
                    </tr>
                    <tr>
                        <th>상태</th>
                        <td>{notice.erpNotiStatus}</td>
                    </tr>
                    <tr>
                        <th>작성일</th>
                        <td>{new Date(notice.erpNotiCreatedAt).toLocaleString()}</td>   {/* Date 객체를 지역화된 날짜 및 시간 문자열로 변환 */}
                    </tr>
                    <tr>
                        <th>수정일</th>
                        <td>{notice.erpNotiUpdatedAt ? new Date(notice.erpNotiUpdatedAt).toLocaleString() : '수정 기록 없음'}</td>
                    </tr>

                     {/* 첨부 파일 있을 경우 다운로드 링크 표시 */}
                    {notice.erpNotiOriginalFile && (
                        <tr>
                            <th>첨부 파일</th>
                            <td>
                                <a  // 하이퍼링크(anchor) 생성
                                    href={`http://localhost:8081/api/notices/download-by-id/${notice.erpNotiId}`}
                                    className="notice-file-link"
                                    download    // download속성 : 링크 클릭하면 파일 자동으로 다운로드
                                >
                                    📎 {notice.erpNotiOriginalFile}
                                </a>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 본문 내용 영역 */}
            <div className="notice-detail-content">
                <h4>내용</h4>
                <div className="notice-content-textarea">
                    {notice.erpNotiContent}
                </div>
            </div>

            {/* 하단 버튼 영역 */}
            <div className="notice-detail-buttons">
                <button className="notice-button" onClick={onBack}>목록으로</button>
                <button className="notice-button" onClick={() => onEdit(id)}>수정</button>
            </div>
        </div>
    );
}

export default ErpNotiDetail;
