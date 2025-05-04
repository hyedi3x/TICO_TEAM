import React, { useEffect, useState } from 'react';
import { Panel, Message, toaster } from 'rsuite';
import axiosInstance from '../../login/social/utils/axiosInstance';
import './userDetail.css';

const UserInfoEdit = ({ uuid, onBack }) => {
  // 사용자 정보 상태값 초기화
  const [formValue, setFormValue] = useState({
    name: '',
    nickname: '',
    phone: '',
    email: '',
    provider: ''
  });
  const [loading, setLoading] = useState(false);  // 저장 버튼 로딩 상태
  const [errorMsg, setErrorMsg] = useState('');   // 에러 메시지 상태

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    if (!uuid) return;

    axiosInstance.get(`/api/users/${uuid}`)
      .then((res) => {
        setFormValue(res.data);     // 사용자 정보 세팅
        setErrorMsg('');
      })
      .catch((err) => {
        console.error('유저 정보 로드 실패:', err);
        setErrorMsg('사용자 정보를 불러오는 데 실패했습니다.');
      });
  }, [uuid]);

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue((prev) => ({ ...prev, [name]: value }));
  };

  // 사용자 정보 수정 요청
  const handleSubmit = () => {
    setLoading(true);

    const { name, nickname, phone } = formValue;
    axiosInstance.put(`/api/users/${uuid}`, { name, nickname, phone })
      .then(() => {
        toaster.push(<Message showIcon type="success">수정 완료</Message>, { placement: 'topEnd' });
        onBack();
      })
      .catch(() => {
        toaster.push(<Message showIcon type="error">수정 실패</Message>, { placement: 'topEnd' });
      })
      .finally(() => setLoading(false));
  };

  // 에러 발생 시 메시지 출력
  if (errorMsg) return <Message type="error" showIcon>{errorMsg}</Message>;
  // 데이터 로딩 중 표시
  if (!formValue.email) return <div>로딩 중...</div>;

  const { name, nickname, phone, email, provider } = formValue;

  return (
    <div className="user-detail-wrapper">
      <Panel bordered header="👤 회원 정보 수정" className="user-detail-panel">
        <table className="user-info-table">
          <tbody>
            <tr>
              <th>이름</th>
              <td><input name="name" value={name} onChange={handleChange} /></td>
            </tr>
            <tr>
              <th>이메일</th>
              <td><input name="email" value={email} readOnly className="readonly-input" /></td>
            </tr>
            <tr>
              <th>닉네임</th>
              <td><input name="nickname" value={nickname} onChange={handleChange} /></td>
            </tr>
            <tr>
              <th>전화번호</th>
              <td><input name="phone" value={phone} onChange={handleChange} /></td>
            </tr>
            <tr>
              <th>가입 방식</th>
              <td><input name="provider" value={provider} readOnly className="readonly-input" /></td>
            </tr>
          </tbody>
        </table>

        <div className="back-button">
          <button type="button" onClick={handleSubmit} disabled={loading}>저장</button>
          <button type="button" onClick={onBack} style={{ marginLeft: '10px' }}>취소</button>
        </div>
      </Panel>
    </div>
  );
};

export default UserInfoEdit;
