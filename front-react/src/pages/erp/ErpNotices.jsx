import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './erpNotices.css';

function ErpNotices({ onViewDetail, onEdit }) {
    // 상태 정의
    const [notices, setNotices] = useState([]);              // 공지 목록 데이터
    const [searchTerm, setSearchTerm] = useState('');        // 검색어
    const [searchType, setSearchType] = useState('title');   // 검색 유형 (제목/내용 등)
    const [categories, setCategories] = useState([]);        // 전체 카테고리 목록
    const [selectedType, setSelectedType] = useState('');    // 선택된 카테고리
    const [statusFilter, setStatusFilter] = useState('');    // 상태 필터 (active/inactive)

    // 정렬 조건을 백엔드로 넘겨주는 핵심 키
    const [sortField, setSortField] = useState('');          // 정렬 필드 (empId, 작성일 등)
    const [sortOrder, setSortOrder] = useState('asc');       // 정렬 방향

    // 페이지
    const [currentPage, setCurrentPage] = useState(0);       // 현재 페이지
    const [totalPages, setTotalPages] = useState(0);         // 전체 페이지 수
    const pageSize = 10;        // 페이지당 표시할 항목 수

    // 검색 및 필터 처리 함수
    const handleSearch = useCallback(() => {    // 	useCallback( ) : handleSearch() 함수의 메모이제이션. 불필요한 재생성 방지.
        const params = {
            keyword: searchTerm,
            searchType: searchType,
            category: selectedType || undefined,
            status: statusFilter || undefined,
            page: currentPage,
            size: pageSize,
            sort: sortField ? `${sortField},${sortOrder}` : undefined,
        };

        axios.get('http://localhost:8081/api/notices/search', { params })
            .then(response => {
                const data = response.data;
                setNotices(data.content);       // 공지 목록 저장
                setTotalPages(data.totalPages); // 전체 페이지 수 저장

                // 공지에서 카테고리 목록 추출 (중복 제거)
                const uniqueTypes = [...new Set(data.content.map(notice => notice.erpNotiType))];
                setCategories(uniqueTypes);
            })
            .catch(error => {
                console.error('Error fetching notices:', error);
            });
    }, [searchTerm, searchType, selectedType, statusFilter, sortField, sortOrder, currentPage]);

    // 최초 렌더링 또는 의존성 변경 시 검색 수행
    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    // 초기화 버튼 클릭 시
    const handleReset = () => {
        setSearchTerm('');
        setSearchType('title');
        setSelectedType('');
        setStatusFilter('');
        setSortField('');
        setSortOrder('asc');
        setCurrentPage(0);
    };

     // 날짜 포맷 변환 함수
    const formatDate = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // 삭제 처리 함수
    const handleDelete = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            axios.delete(`http://localhost:8081/api/notices/delete/${id}`)
                .then(() => {
                    handleSearch();     // 삭제 후 목록 갱신
                })
                .catch(error => {
                    console.error('Error deleting notice:', error);
                });
        }
    };

    // 정렬 클릭 시 정렬 상태 변경
    const toggleSort = (field) => {
        if (sortField === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(0);
    };

    // 정렬 화살표 표시
    const renderSortArrow = (field) => {
        if (sortField !== field) return '▲▼';
        return sortOrder === 'asc' ? '▲' : '▼';
    };

    // 페이지 변경 처리
    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="notice-list-container">
            <h3>공지사항 목록</h3>

            {/* 검색 바 영역 */}
            <div className="search-bar">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                    <option value="titleAndContent">제목+내용</option>
                </select>
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}      // 엔터 키 입력 시
                />
                <button onClick={handleSearch}>검색</button>
                <button className="reset-button" onClick={handleReset}>초기화</button>
            </div>

            {/* 공지사항 목록 테이블 */}
            <table>
                <thead>
                    <tr>
                        <th>제목</th>
                        <th>내용</th>
                        <th onClick={() => toggleSort('empId')} style={{ cursor: 'pointer' }}>
                            작성자 {renderSortArrow('empId')}
                        </th>
                        <th onClick={() => toggleSort('erpNotiCreatedAt')} style={{ cursor: 'pointer' }}>
                            작성일 {renderSortArrow('erpNotiCreatedAt')}
                        </th>
                        <th>
                            {/* 카테고리(유형) 필터 */}
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                <option value="">전체 유형</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </th>
                        <th>
                            {/* 상태 필터 */}
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">전체</option>
                                <option value="active">활성</option>
                                <option value="inactive">비활성</option>
                            </select>
                        </th>
                        <th>수정</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map(notice => (
                        <tr key={notice.erpNotiId}>
                            <td>
                                <span className="notice-link" onClick={() => onViewDetail(notice.erpNotiId)}>
                                    {notice.erpNotiTitle}
                                </span>
                                </td>
                                <td className="ellipsis-cell" title={notice.erpNotiContent}>    {/* ellipsis-cell : 너무 긴 내용은 말줄임 처리 */}
                                <span className="notice-link" onClick={() => onViewDetail(notice.erpNotiId)}>
                                    {notice.erpNotiContent}
                                </span>
                            </td>
                            <td>{notice.empId}</td>
                            <td>{formatDate(notice.erpNotiCreatedAt)}</td>
                            <td>{notice.erpNotiType}</td>
                            <td>{notice.erpNotiStatus}</td>
                            <td>
                                <button className="edit-button" onClick={() => onEdit(notice.erpNotiId)}>수정</button>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(notice.erpNotiId)}>삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이징 영역 */}
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>이전</button>
                {Array.from({ length: totalPages }, (_, idx) => (   // 페이지 수 만큼 숫자 버튼 만들기 위한 반복 배열 생성
                    <button
                        key={idx}   // 0부터 시작하는 페이지 인덱스
                        onClick={() => handlePageChange(idx)}
                        className={idx === currentPage ? 'active' : ''}     // active 클래스 추가(색상 강조)
                    >
                        {idx + 1}
                    </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>다음</button>
            </div>
        </div>
    );
}

export default ErpNotices;
