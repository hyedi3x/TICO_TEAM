import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ButtonToolbar, Form, Panel, Radio, RadioGroup, SelectPicker } from 'rsuite';
import axiosInstance from '../login/social/utils/axiosInstance';
import StudySelector from '../../blockly/study/StudySelector';
import './ProjectEditMeta.css'; // 동일한 스타일 사용 가능

const CATEGORY_OPTIONS = [
    { label: '기타', value: '기타' },
    { label: '게임', value: '게임' },
    { label: '예술', value: '예술' },
    { label: '도구', value: '도구' }
];

const DIFFICULTY_OPTIONS = [
    { label: '쉬움', value: '쉬움' },
    { label: '중간', value: '중간' },
    { label: '어려움', value: '어려움' },
];

const DURATION_OPTIONS = [
    { label: '15분', value: '15분' },
    { label: '30분', value: '30분' },
    { label: '1시간 이상', value: '1시간 이상' },
];
  
function StudyEdit() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);  // 선택된 작품
  const [showSelector, setShowSelector] = useState(false);  // 작품 선택 모달 표시 여부

  useEffect(() => {
    axiosInstance.get(`/api/study/${studyId}`)
      .then(res => {
        const data = res.data;
        setStudy({
          ...data,
          introduction: data.introduction || '',
          guide: data.guide || '',
          notes: data.notes || '',
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        });
      })
      .catch(() => alert('스터디 정보를 불러오지 못했습니다.'));
  }, [studyId]);

  const handleFormChange = (formValue) => setStudy(formValue);

  const handleSave = () => {
    const toSend = {
      ...study,
      introduction: typeof study.introduction === 'string' ? study.introduction : '',
      goal: typeof study.goal === 'string' ? study.goal : '',
      projectId: selectedProject ? selectedProject.projectId : null,  // 선택된 작품 ID 추가
    };
    axiosInstance.put(`/api/study/updateMeta`, toSend)
      .then(() => {
        alert('수정 완료!');
        navigate(`/shareStudy`);
      })
      .catch(() => alert('수정 실패'));
  };

  if (!study) return <div>로딩 중...</div>;

  return (
    <div className="project-edit-bg">
      <Panel bordered shaded className="project-edit-panel">
        <div className="project-edit-inner">
          <h2 className="project-edit-title">스터디 정보 수정</h2>
          <Form fluid formValue={study} onChange={handleFormChange} className="project-edit-form">

            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">제목</Form.ControlLabel>
              <Form.Control name="title" className="project-edit-input" />
            </Form.Group>
            <Form.Group style={{ marginBottom: 22 }}>
                <Form.ControlLabel className="project-edit-label">난이도</Form.ControlLabel>
                <Form.Control
                    name="difficulty"
                    accepter={SelectPicker}
                    data={DIFFICULTY_OPTIONS}
                    value={study.difficulty}
                    className="project-edit-input"
                    placeholder="난이도 선택"
                    cleanable
                />
            </Form.Group>
            <Form.Group style={{ marginBottom: 22 }}>
                <Form.ControlLabel className="project-edit-label">예상 소요 시간</Form.ControlLabel>
                <Form.Control
                    name="duration"
                    accepter={SelectPicker}
                    data={DURATION_OPTIONS}
                    value={study.duration}
                    className="project-edit-input"
                    placeholder="예상 소요 시간"
                    cleanable
                />
            </Form.Group>
             {/* 작품 선택 (StudySelector 모달) */}
             <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">작품 선택</Form.ControlLabel>
              <Button appearance="ghost" onClick={() => setShowSelector(true)}>작품 선택</Button>
              {selectedProject && (
                <div>
                  <p>선택된 작품: {selectedProject.title}</p>
                  <img src={`https://tico.kro.kr${selectedProject.thumbnailUrl}`} alt="작품 썸네일" style={{ width: '100px', borderRadius: '8px' }} />
                </div>
              )}
            </Form.Group>

            {/* 공개 여부 */}
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">공개 여부</Form.ControlLabel>
              <Form.Control name="isprivate" accepter={RadioGroup} inline className="project-edit-input">
                <Radio value="N" style={{ color: "#13d2b4", fontWeight: 600 }}>공개</Radio>
                <Radio value="Y" style={{ color: "#888", fontWeight: 600 }}>비공개</Radio>
              </Form.Control>
            </Form.Group>
            {/* 카테고리 */}
            <Form.Group style={{ marginBottom: 22 }}>
                <Form.ControlLabel className="project-edit-label">카테고리</Form.ControlLabel>
                <Form.Control
                name="category"
                accepter={SelectPicker}
                data={CATEGORY_OPTIONS}
                className="project-edit-input"
                cleanable
                placeholder="카테고리 선택"
                />
            </Form.Group>
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">공개 여부</Form.ControlLabel>
              <Form.Control name="isprivate" accepter={RadioGroup} inline className="project-edit-input">
                <Radio value="N" style={{ color: "#13d2b4", fontWeight: 600 }}>공개</Radio>
                <Radio value="Y" style={{ color: "#888", fontWeight: 600 }}>비공개</Radio>
              </Form.Control>
            </Form.Group>
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">댓글 사용</Form.ControlLabel>
              <Form.Control name="iscomment" accepter={RadioGroup} inline className="project-edit-input">
                <Radio value="Y" style={{ color: "#13d2b4", fontWeight: 600 }}>사용</Radio>
                <Radio value="N" style={{ color: "#888", fontWeight: 600 }}>사용 안 함</Radio>
              </Form.Control>
            </Form.Group>
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">소개</Form.ControlLabel>
              <Form.Control
                name="introduction"
                rows={3}
                accepter="textarea"
                className="project-edit-input"
                value={study.introduction}
              />
            </Form.Group>
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">목표</Form.ControlLabel>
              <Form.Control
                name="goal"
                rows={3}
                accepter="textarea"
                className="project-edit-input"
                value={study.goal}
              />
            </Form.Group>
            <Form.Group style={{ textAlign: "center" }}>
              <ButtonToolbar style={{ display: "flex", justifyContent: "center" }}>
                <Button appearance="primary" className="project-edit-btn-primary" onClick={handleSave}>
                  수정
                </Button>
                <Button appearance="ghost" className="project-edit-btn-ghost" onClick={() => navigate(-1)}>
                  취소
                </Button>
              </ButtonToolbar>
            </Form.Group>
          </Form>
        </div>
      </Panel>
      <StudySelector
      isOpen={showSelector}
      onClose={() => setShowSelector(false)}
      onSelect={(project) => {
        setSelectedProject(project);
      }}
    />
    </div>
  );
}

export default StudyEdit;