import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../login/social/utils/axiosInstance';
import {Form, Button, Panel, TagInput, SelectPicker, RadioGroup, Radio, ButtonToolbar} from 'rsuite';
import './ProjectEditMeta.css';

const CATEGORY_OPTIONS = [
  { label: '기타', value: '기타' },
  { label: '게임', value: '게임' },
  { label: '예술', value: '예술' },
  { label: '도구', value: '도구' }
];

function ProjectEditMeta() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/api/project/${projectId}`)
      .then(res => {
        const data = res.data.project || res.data;
        setProject({
          ...data,
          introduction: typeof data.introduction === 'string' ? data.introduction : '',
          guide: typeof data.guide === 'string' ? data.guide : '',
          notes: typeof data.notes === 'string' ? data.notes : '',
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        });
      })
      .catch(() => alert('프로젝트 정보를 불러오지 못했습니다.'));
  }, [projectId]);

  const handleFormChange = formValue => setProject(formValue);

  const handleSave = () => {
    const projectToSend = { 
      ...project, 
      tags: Array.isArray(project.tags) ? project.tags.join(',') : project.tags,
      introduction: typeof project.introduction === 'string' ? project.introduction : '',
      guide: typeof project.guide === 'string' ? project.guide : '',
      notes: typeof project.notes === 'string' ? project.notes : ''
    };
    axiosInstance.put('/api/project/updateMeta', projectToSend)
    .then(() => {
        alert('수정 완료!');
        navigate(`/share/detail/${projectId}`);
    })
    .catch(() => alert('수정에 실패했습니다.'));
  };

  if (!project) return <div>로딩 중...</div>;

  return (
    <div className="project-edit-bg">
      <Panel bordered shaded className="project-edit-panel">
        <div className="project-edit-inner">
          <h2 className="project-edit-title">작품 정보 수정</h2>
          <Form
            fluid
            formValue={project}
            onChange={handleFormChange}
            className="project-edit-form"
          >
            {/* 제목 */}
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">제목</Form.ControlLabel>
              <Form.Control name="title" className="project-edit-input" />
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
            {/* 태그 */}
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">
                태그 (엔터로 추가)
              </Form.ControlLabel>
              <Form.Control
                name="tags"
                accepter={TagInput}
                className="project-edit-input"
                placeholder="태그를 입력하세요"
              />
            </Form.Group>
            {/* 공개/비공개 */}
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">공개 여부</Form.ControlLabel>
              <Form.Control
                name="isPrivate"
                accepter={RadioGroup}
                inline
                className="project-edit-input"
              >
                <Radio value="N" style={{ color: "#13d2b4", fontWeight: 600 }}>공개</Radio>
                <Radio value="Y" style={{ color: "#888", fontWeight: 600 }}>비공개</Radio>
              </Form.Control>
            </Form.Group>
            {/* 댓글 */}
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">댓글 사용</Form.ControlLabel>
              <Form.Control
                name="isComment"
                accepter={RadioGroup}
                inline
                className="project-edit-input"
              >
                <Radio value="Y" style={{ color: "#13d2b4", fontWeight: 600 }}>사용</Radio>
                <Radio value="N" style={{ color: "#888", fontWeight: 600 }}>사용 안 함</Radio>
              </Form.Control>
            </Form.Group>
            {/* 소개 */}
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">소개</Form.ControlLabel>
              <Form.Control
                name="introduction"
                rows={3}
                accepter="textarea"
                className="project-edit-input"
                value={project.introduction}
              />
            </Form.Group>
            {/* 사용법 */}
            <Form.Group style={{ marginBottom: 22 }}>
              <Form.ControlLabel className="project-edit-label">사용법</Form.ControlLabel>
              <Form.Control
                name="guide"
                rows={3}
                accepter="textarea"
                className="project-edit-input"
                value={project.guide}
              />
            </Form.Group>
            {/* 참고사항 */}
            <Form.Group style={{ marginBottom: 32 }}>
              <Form.ControlLabel className="project-edit-label">참고사항</Form.ControlLabel>
              <Form.Control
                name="notes"
                rows={3}
                accepter="textarea"
                className="project-edit-input"
                value={project.notes}
              />
            </Form.Group>
            <Form.Group style={{ textAlign: "center" }}>
              <ButtonToolbar style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  className="project-edit-btn-primary"
                  appearance="primary"
                  onClick={handleSave}
                >
                  수정
                </Button>
                <Button
                  className="project-edit-btn-ghost"
                  appearance="ghost"
                  onClick={() => navigate(-1)}
                >
                  취소
                </Button>
              </ButtonToolbar>
            </Form.Group>
          </Form>
        </div>
      </Panel>
    </div>
  );
}

export default ProjectEditMeta;