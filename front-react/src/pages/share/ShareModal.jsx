import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
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
      // 작품 목록 불러오기
      axios.get(`http://localhost:8081/project/userProjects/${userUuid}`)
        .then(res => setMyProjects(res.data));
  
      // ✅ 상태 초기화
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
    if (url.startsWith('http')) return url; // 이미 전체 URL이면 그대로
    return `http://localhost:8081${url}`;    // 상대경로면 도메인 붙여줌
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
      await axios.put("http://localhost:8081/project/shareProject", {
        projectInfo,
      });
      alert("공유 완료!");
      onClose();
    } catch (err) {
      alert("공유 실패");
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>작품 공유하기</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === 1 && (
          <>
            <p>공유할 작품을 선택해주세요.</p>
            <Row>
              {myProjects.map(project => (
                <Col xs={12} sm={6} md={4} key={project.projectId}>
                  <Card
                    onClick={() => setSelected(project)}
                    className={`project-card ${selected?.projectId === project.projectId ? 'selected' : ''}`}
                  >
                    <Card.Img
                      variant="top"
                      src={resolveThumbnailUrl(project.thumbnailUrl)}
                      className="thumbnail"
                    />
                    <Card.Body>
                      <Card.Title className="title">{project.title}</Card.Title>
                      {project.isPrivate === 'Y' && (
                        <Badge bg="secondary" className="private-badge">비공개</Badge>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {step === 2 && (
          <>
            <p><strong>공유 정보 입력</strong></p>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>카테고리</Form.Label>
                <Form.Select value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                  <option>기타</option>
                  <option>게임</option>
                  <option>예술</option>
                  <option>도구</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>태그 (쉼표로 구분)</Form.Label>
                <Form.Control type="text" value={form.tags} onChange={(e) => handleChange('tags', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>작품 소개</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.introduction} onChange={(e) => handleChange('introduction', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>사용 방법</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.guide} onChange={(e) => handleChange('guide', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>참고 사항</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </Form.Group>

              <Form.Check
                type="checkbox"
                label="작품 공유에 동의합니다."
                checked={form.isAgree}
                onChange={(e) => handleChange('isAgree', e.target.checked)}
              />
            </Form>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {step === 2 && <Button variant="secondary" onClick={() => setStep(1)}>← 이전</Button>}
        {step === 1 && <Button variant="primary" onClick={() => selected ? setStep(2) : alert("작품을 선택하세요.")}>다음 →</Button>}
        {step === 2 && <Button variant="success" onClick={handleSubmit}>공유 완료</Button>}
      </Modal.Footer>
    </Modal>
  );
}

export default ShareModal;