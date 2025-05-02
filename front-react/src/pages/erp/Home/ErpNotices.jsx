import React, { useState, useEffect, useCallback } from 'react';
import './erpNotices.css';
import axiosInstance from '../../login/social/utils/axiosInstance';

function ErpNotices({ onViewDetail, onEdit }) {
    const currentEmpId = localStorage.getItem('user_uuid');

    const [notices, setNotices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('title');
    const [categories, setCategories] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);

    const [sortField, setSortField] = useState('erpNotiCreatedAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const handleSearch = useCallback(() => {
        const params = {
            keyword: searchTerm,
            searchType,
            category: selectedType || undefined,
            status: statusFilter || undefined,
            empId: showMyPostsOnly ? currentEmpId : undefined,
            page: currentPage,
            size: pageSize,
            sort: sortField ? `${sortField},${sortOrder}` : 'erpNotiCreatedAt,desc',
        };

        axiosInstance.get('/api/notices/search', { params })
            .then(response => {
                const data = response.data;
                setNotices(data.content);
                setTotalPages(data.totalPages);

                const uniqueTypes = [...new Set(data.content.map(n => n.erpNotiType))];
                setCategories(uniqueTypes);
            })
            .catch(error => console.error('공지 불러오기 실패:', error));
    }, [searchTerm, searchType, selectedType, statusFilter, sortField, sortOrder, currentPage, showMyPostsOnly]);

    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    const handleReset = () => {
        setSearchTerm('');
        setSearchType('title');
        setSelectedType('');
        setStatusFilter('');
        setSortField('erpNotiCreatedAt');
        setSortOrder('desc');
        setCurrentPage(0);
        setShowMyPostsOnly(false);
    };

    const formatDate = (datetime) => {
        if (!datetime) return '';
        const date = new Date(datetime);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const handleDelete = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            axiosInstance.delete(`/api/notices/delete/${id}`)
                .then(() => handleSearch())
                .catch(error => console.error('삭제 실패:', error));
        }
    };

    const toggleSort = (field) => {
        setSortOrder(sortField === field ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
        setSortField(field);
        setCurrentPage(0);
    };

    const renderSortArrow = (field) => {
        if (sortField !== field) return '▲▼';
        return sortOrder === 'asc' ? '▲' : '▼';
    };

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    // ✅ 상태만 변경
    const handleToggleMyPostsOnly = () => {
        setShowMyPostsOnly(prev => !prev);
        setCurrentPage(0); // 페이지도 초기화
    };

    // ✅ 검색 useEffect 업데이트
    useEffect(() => {
        handleSearch();
    }, [
        handleSearch,
        showMyPostsOnly, // 🔑 추가
        currentPage // 🔑 추가 (이미 있을 수도 있음)
    ]);


    return (
        <div className="notice-list-container">
            <h3>공지사항 목록</h3>

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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>검색</button>
                <button className="reset-button" onClick={handleReset}>초기화</button>
                <button className="toggle-button" onClick={handleToggleMyPostsOnly}>
                    {showMyPostsOnly ? '전체 공지 보기' : '내 게시물만 보기'}
                </button>
            </div>

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
                            <select className="noti-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                <option value="">전체 유형</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </th>
                        <th>
                            <select className="noti-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                            <td className="ellipsis-cell" title={notice.erpNotiContent}>
                                <span className="notice-link" onClick={() => onViewDetail(notice.erpNotiId)}>
                                    {notice.erpNotiContent}
                                </span>
                            </td>
                            <td>{notice.empId}</td>
                            <td>{formatDate(notice.erpNotiCreatedAt)}</td>
                            <td>{notice.erpNotiType}</td>
                            <td>{notice.erpNotiStatus}</td>
                            <td>
                                {notice.empId === currentEmpId ? (
                                    <button className="noti-edit-button" onClick={() => onEdit(notice.erpNotiId)}>수정</button>
                                ) : (
                                    <button className="noti-edit-button" disabled>수정</button>
                                )}
                            </td>
                            <td>
                                {notice.empId === currentEmpId ? (
                                    <button className="noti-delete-button" onClick={() => handleDelete(notice.erpNotiId)}>삭제</button>
                                ) : (
                                    <button className="noti-delete-button" disabled>삭제</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>이전</button>
                {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handlePageChange(idx)}
                        className={idx === currentPage ? 'active' : ''}
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
