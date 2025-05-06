import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, SelectPicker, Checkbox, Grid, Row, Col, Card, Badge } from 'rsuite';
import axiosInstance from '../login/social/utils/axiosInstance';
import './ShareModal.css';

function StudyShareModal({ show, onClose }) {
  const [step, setStep] = useState(1);
  const [myStudies, setMyStudies] = useState([]); // 비공개 스터디 목록 상태
  const [selectedStudy, setSelectedStudy] = useState(null); // 선택된 스터디 상태

  const [form, setForm] = useState({
    category: '기타',
    introduction: '',
    goal: '',
    difficulty: '쉬움',
    duration: '15분',
    isagree: false,
  });

  const userUuid = localStorage.getItem("user_uuid");

  useEffect(() => {
    if (show) {
      // 모달이 열리면 비공개 스터디 목록을 가져오기
      axiosInstance.get(`/api/study/private?userUuid=${userUuid}`)
        .then(res => setMyStudies(res.data));

      // 초기화
      setStep(1);
      setSelectedStudy(null);
      setForm({
        category: '기타',
        introduction: '',
        goal: '',
        difficulty: '쉬움',
        duration: '15분',
        isagree: false
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
    if (!form.isagree) return alert("공유 동의가 필요합니다.");

    const studyInfo = {
      studyId: selectedStudy.studyId, // study_tb에서 사용하는 studyId
      projectId: selectedStudy.projectId, // project_tb에서 사용하는 projectId
      isprivate: "N", // 공개 스터디로 변경
      category: form.category,
      introduction: form.introduction,
      goal: form.goal,
      difficulty: form.difficulty,
      duration: form.duration,
      isagree: "Y", // 동의 상태
      iscomment: 'Y' // 댓글 허용
    };

    try {
      await axiosInstance.put("/api/study/shareStudy", { studyInfo });
      alert("스터디 공유 완료!");
      onClose();
    } catch (err) {
      alert("스터디 공유 실패");
    }
  };

  const handleStudySelect = (study) => {
    setSelectedStudy(study); // 선택된 스터디 설정
    setForm({
      category: study.category,
      introduction: study.introduction,
      goal: study.goal,
      difficulty: study.difficulty,
      duration: study.duration,
      isagree: false,
    });
    setStep(2); // 다음 단계로 진행
  };

  return (
    <Modal open={show} onClose={onClose} backdrop="static" keyboard={false} size="lg">
      <Modal.Header>
        <Modal.Title>스터디 공유하기</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 1 && (
          <>
            <p>공유할 스터디를 선택해주세요.</p>
            <Grid fluid>
              <Row gutter={16}>
                {myStudies.map(study => (
                  <Col xs={24} sm={12} md={8} key={study.studyId} style={{ marginBottom: 24 }}>
                    <Card
                      onClick={() => handleStudySelect(study)}
                      className={`rsuite-project-card${selectedStudy?.studyId === study.studyId ? ' selected' : ''}`}
                      style={{
                        border: selectedStudy?.studyId === study.studyId ? '2px solid #3498ff' : '1px solid #eee',
                        cursor: 'pointer',
                        minWidth: 260,
                        minHeight: 330,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.09)',
                        borderRadius: 18,
                        fontSize: 17
                      }}
                    >
                      <img
                        src={resolveThumbnailUrl(study.thumbnailUrl)}
                        style={{ width: '100%', height: 200, objectFit: 'contain', borderRadius: '18px 18px 0 0' }}
                        alt={study.title}
                      />
                      <Card.Body>
                        <div style={{ fontWeight: 600, fontSize: 19, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {study.title}
                        </div>
                        {study.isprivate === 'Y' &&
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
                data={[{ label: '기타', value: '기타' }, { label: '게임', value: '게임' }, { label: '예술', value: '예술' }, { label: '도구', value: '도구' }]}
                value={form.category}
                onChange={value => handleChange('category', value)}
                style={{ width: 200 }}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>스터디 소개</Form.ControlLabel>
              <Input as="textarea" rows={2} value={form.introduction} onChange={value => handleChange('introduction', value)} />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>스터디 목표</Form.ControlLabel>
              <Input as="textarea" rows={2} value={form.goal} onChange={value => handleChange('goal', value)} />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>난이도</Form.ControlLabel>
              <SelectPicker
                data={[{ label: '쉬움', value: '쉬움' }, { label: '중간', value: '중간' }, { label: '어려움', value: '어려움' }]}
                value={form.difficulty}
                onChange={value => handleChange('difficulty', value)}
                style={{ width: 200 }}
              />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>소요 시간</Form.ControlLabel>
              <SelectPicker
                data={[{ label: '15분', value: '15분' }, { label: '30분', value: '30분' }, { label: '1시간 이상', value: '1시간 이상' }]}
                value={form.duration}
                onChange={value => handleChange('duration', value)}
                style={{ width: 200 }}
              />
            </Form.Group>
            <Form.Group>
              <Checkbox checked={form.isagree} onChange={(_, checked) => handleChange('isagree', checked)}>
                스터디 공유에 동의합니다.
              </Checkbox>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step === 2 && <Button appearance="subtle" onClick={() => setStep(1)}>← 이전</Button>}
        {step === 1 && <Button appearance="primary" onClick={() => selectedStudy ? setStep(2) : alert("스터디를 선택하세요.")}>다음 →</Button>}
        {step === 2 && <Button appearance="primary" color="green" onClick={handleSubmit}>공유 완료</Button>}
      </Modal.Footer>
    </Modal>
  );
}

export default StudyShareModal;