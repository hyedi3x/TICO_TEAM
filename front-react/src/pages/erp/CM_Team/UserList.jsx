import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {Panel,Message,Loader,toaster,Input,Pagination} from 'rsuite';
import './userList.css';

function UserList({ onUserClick }) {
  // 상태 정의
  const [users, setUsers] = useState([]);               // 사용자 목록
  const [loading, setLoading] = useState(true);         // 로딩 상태
  const [searchKeyword, setSearchKeyword] = useState(''); // 검색어
  const [page, setPage] = useState(1);                  // 현재 페이지
  const [pageSize] = useState(10);                      // 페이지당 항목 수 (고정)
  const [total, setTotal] = useState(0);                // 전체 사용자 수

  // 사용자 목록 불러오기 함수 (searchKeyword와 page는 매개변수로만 받음)
  const fetchUsers = useCallback((keyword = '', targetPage = 1) => {
    setLoading(true);

    axios.get('http://localhost:8081/api/users/search', {
      params: {
        keyword,
        page: targetPage,
        size: pageSize
      }
    })
      .then((res) => {
        setUsers(res.data.content);
        setTotal(res.data.totalElements);
      })
      .catch((err) => {
        console.error('유저 목록 로딩 실패:', err);
        toaster.push(
          <Message showIcon type="error">유저 불러오기 실패</Message>,
          { placement: 'topEnd' }
        );
      })
      .finally(() => setLoading(false));
  }, [pageSize]);

  // 📌 최초 렌더링 시 전체 목록 불러오기
  useEffect(() => {
    fetchUsers('', 1);
  }, [fetchUsers]);

  // 검색 버튼 클릭
  const handleSearch = () => {
    setPage(1);
    fetchUsers(searchKeyword, 1);
  };

  // 검색 초기화 버튼 클릭
  const handleReset = () => {
    const resetKeyword = '';
    setSearchKeyword(resetKeyword);
    setPage(1);
    fetchUsers(resetKeyword, 1);
  };

  // 페이지네이션 변경
  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    fetchUsers(searchKeyword, nextPage);
  };

  // 로딩 중일 때 로더 표시
  if (loading) return <Loader center content="로딩 중..." />;

  return (
    <div className="UserList-container">
      <Panel bordered shaded className="UserList-card" header={<h4>👤 회원 목록</h4>}>

        {/* 검색 영역 */}
        <div className="UserList-search-bar">
          <Input
            placeholder="이름으로 검색..."
            value={searchKeyword}
            onChange={setSearchKeyword}
            onPressEnter={handleSearch}
            style={{ width: 300, marginRight: 8 }}
          />
          <button onClick={handleSearch} className="UserList-search-button">검색</button>
          <button onClick={handleReset} className="UserList-reset-button">초기화</button>
        </div>

        {/* 사용자 테이블 */}
        <div className="UserList-table-wrapper">
          <table className="UserList-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>닉네임</th>
                <th>이용권</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userUuid} onClick={() => onUserClick(user.userUuid)}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.nickname}</td>
                  <td className={user.active ? 'active' : 'inactive'}>
                    {user.active ? '✅ active' : '❌ inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="UserList-pagination-wrapper">
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

export default UserList;
