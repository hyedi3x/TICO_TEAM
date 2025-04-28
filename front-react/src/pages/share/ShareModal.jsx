import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, SelectPicker, Checkbox, Grid, Row, Col, Card, Badge } from 'rsuite';
import axiosInstance from '../login/social/utils/axiosInstance';
import './ShareModal.css';

function ShareModal({ show, onClose }) {
  const [step, setStep] = useState(1);
  const [myProjects, setMyProjects] = useState([]);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    category: '기타',
    tags: '',
    introduction: '',
    guide: '',
    notes: '',
    isAgree: false
  });

  const userUuid = localStorage.getItem("user_uuid");

  useEffect(() => {
    if (show) {
      axiosInstance.get(`/api/project/userProjects/${userUuid}`)
        .then(res => setMyProjects(res.data));

      setStep(1);
      setSelected(null);
      setForm({
        category: '기타',
        tags: '',
        introduction: '',
        guide: '',
        notes: '',
        isAgree: false
      });
    }
  }, [show]);

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.isAgree) return alert("공유 동의가 필요합니다.");

    const projectInfo = {
      ...selected,
      isPrivate: "N",
      isAgree: "Y",
      category: form.category,
      tags: form.tags,
      introduction: form.introduction,
      guide: form.guide,
      notes: form.notes
    };

    try {
      await axiosInstance.put("/api/project/shareProject", { projectInfo });
      alert("공유 완료!");
      onClose();
    } catch (err) {
      alert("공유 실패");
    }
  };

  const handleProjectSelect = (project) => {
    if (project.isPrivate === 'N') {
      alert("이미 공유된 작품입니다.");
    } else {
      setSelected(project);
    }
  };

  return (
    <Modal open={show} onClose={onClose} backdrop="static" keyboard={false} size="lg">
      <Modal.Header>
        <Modal.Title>작품 공유하기</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 1 && (
          <>
            <p>공유할 작품을 선택해주세요.</p>
            <Grid fluid>
              <Row gutter={16}>
                {myProjects.map(project => (
                  <Col xs={24} sm={12} md={8} key={project.projectId} style={{ marginBottom: 24 }}>
                  <Card
                    onClick={() => handleProjectSelect(project)}
                    className={`rsuite-project-card${selected?.projectId === project.projectId ? ' selected' : ''}`}
                    style={{
                      border: selected?.projectId === project.projectId ? '2px solid #3498ff' : '1px solid #eee',
                      cursor: 'pointer',
                      minWidth: 260,
                      minHeight: 330,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.09)',
                      borderRadius: 18,
                      fontSize: 17
                    }}
                  >
                    <img
                      src={resolveThumbnailUrl(project.thumbnailUrl)}
                      style={{ width: '100%', height: 200, objectFit: 'contain', borderRadius: '18px 18px 0 0' }}
                      alt={project.title}
                    />
                    <Card.Body>
                      <div style={{ fontWeight: 600, fontSize: 19, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{project.title}</div>
                      {project.isPrivate === 'Y' &&
                        <Badge content="비공개" style={{ background: '#888', fontSize: 14, marginTop: 10 }} />
                      }
                    </Card.Body>
                  </Card>
                </Col>
                ))}
              </Row>
            </Grid>
          </>
        )}

        {step === 2 && (
          <Form fluid>
            <p><strong>공유 정보 입력</strong></p>
            <Form.Group>
              <Form.ControlLabel>카테고리</Form.ControlLabel>
              <SelectPicker
                data={[
                  { label: '기타', value: '기타' },
                  { label: '게임', value: '게임' },
                  { label: '예술', value: '예술' },
                  { label: '도구', value: '도구' }
                ]}
                value={form.category}
                onChange={value => handleChange('category', value)}
                style={{ width: 200 }}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>태그 (쉼표로 구분)</Form.ControlLabel>
              <Input value={form.tags} onChange={value => handleChange('tags', value)} />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>작품 소개</Form.ControlLabel>
              <Input as="textarea" rows={2} value={form.introduction} onChange={value => handleChange('introduction', value)} />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>사용 방법</Form.ControlLabel>
              <Input as="textarea" rows={2} value={form.guide} onChange={value => handleChange('guide', value)} />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>참고 사항</Form.ControlLabel>
              <Input as="textarea" rows={2} value={form.notes} onChange={value => handleChange('notes', value)} />
            </Form.Group>
            <Form.Group>
              <Checkbox checked={form.isAgree} onChange={value => handleChange('isAgree', value)}>
                작품 공유에 동의합니다.
              </Checkbox>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step === 2 && <Button appearance="subtle" onClick={() => setStep(1)}>← 이전</Button>}
        {step === 1 && <Button appearance="primary" onClick={() => selected ? setStep(2) : alert("작품을 선택하세요.")}>다음 →</Button>}
        {step === 2 && <Button appearance="primary" color="green" onClick={handleSubmit}>공유 완료</Button>}
      </Modal.Footer>
    </Modal>
  );
}

export default ShareModal;