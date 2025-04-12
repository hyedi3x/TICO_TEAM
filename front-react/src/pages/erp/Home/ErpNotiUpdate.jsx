import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './erpNotiUpdate.css';

// 공지사항 수정 컴포넌트
function ComNotiUpdate({ id, onBack }) {

    // 공지사항 폼 데이터 상태 관리
    const [form, setForm] = useState({
        erpNotiTitle: '',
        erpNotiContent: '',
        empId: '',
        erpNotiType: '',
        erpNotiExpiredAt: '',
        erpNotiFile: '',
    });

    // 새로 선택한 파일 상태
    const [file, setFile] = useState(null);

    // 기존 파일명 (출력용)
    const [existingFile, setExistingFile] = useState('');

    // 최초 렌더링 시 또는 id 변경 시 해당 공지사항 불러오기
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:8081/api/notices/notice/${id}`)
                .then(response => {
                    const data = response.data;
                    const savedEmpId = localStorage.getItem('user_uuid');
                    setForm({
                        ...data,
                        empId: savedEmpId || data.empId, // localStorage에서 가져온 값으로 덮어쓰기
                    });
                    setExistingFile(response.data.erpNotiOriginalFile || '');       // 기존 파일명 저장
                })
                .catch(error => console.error('Error loading notice:', error));
        }
    }, [id]);

    // 인풋 필드 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // 파일 선택 처리
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // 수정 제출
    const handleUpdate = () => {
        const formData = new FormData();
        // 폼에 각 항목 추가
        formData.append('erpNotiTitle', form.erpNotiTitle);
        formData.append('erpNotiContent', form.erpNotiContent);
        formData.append('empId', form.empId);
        formData.append('erpNotiType', form.erpNotiType);
        formData.append('erpNotiExpiredAt', form.erpNotiExpiredAt);
        if (file) {
            formData.append('erpNotiFile', file);   // 새로 선택한 파일이 있으면 포함
        }

        // PUT 요청으로 수정
        axios.put(`http://localhost:8081/api/notices/update/${id}`, formData)
            .then(() => {
                alert('수정 완료했습니다.');
                onBack(); // 저장 완료 후 목록으로 이동
            })
            .catch(error => console.error('수정 오류:', error));
    };

    return (
        <div className="notice-update-container">
            <h3>공지사항 수정</h3>

            <div className="form-group">
                <label>제목</label>
                <input name="erpNotiTitle" value={form.erpNotiTitle} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>내용</label>
                <textarea name="erpNotiContent" value={form.erpNotiContent} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>작성자 ID</label>
                <input name="empId" value={form.empId} readOnly />
            </div>

            <div className="form-group">
                <label htmlFor="erpNotiType">공지사항 유형</label>
                <select name="erpNotiType" value={form.erpNotiType} onChange={handleChange} required>
                    <option value="">유형 선택</option>
                    <option value="일반">일반</option>
                    <option value="긴급">긴급</option>
                    <option value="교육">교육</option>
                    <option value="휴무">휴무</option>
                </select>
            </div>

            <div className="form-group">
                <label>만료일</label>
                <input name="erpNotiExpiredAt" type="date" value={form.erpNotiExpiredAt} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>첨부 파일</label>
                {existingFile && (
                    <div style={{ marginBottom: '5px', fontSize: '14px' }}>
                        기존 파일: <span style={{ color: 'gray' }}>{existingFile}</span>
                    </div>
                )}
                <input type="file" onChange={handleFileChange} />
            </div>

            {/* 버튼 영역 */}
            <div className="form-group" style={{ marginTop: '20px' }}>
                <button type="submit" className='notice-submit'onClick={handleUpdate}>저장</button>
                <button className='notice-button' onClick={onBack} style={{ marginLeft: '10px' }}>취소</button>
            </div>
        </div>
    );
}

export default ComNotiUpdate;
