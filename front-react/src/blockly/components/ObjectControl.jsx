import React from 'react';
import { Form, Row, Col, Card, Button } from 'react-bootstrap';

function ObjectControlPanel({ object, onUpdate, i, onDelete, isSelected, isExpanded, onClick }) {
  if (!object) return null;

  const handleChange = (field, value) => {
    onUpdate({ ...object, [field]: value });
  };

  const title = object.isText
    ? `${i + 1}번째 글상자 속성 (index : ${object.index})`
    : `${i + 1}번째 오브젝트 속성 (index : ${object.index})`;

  return (
    <Card
      style={{
        width: '100%',
        fontSize: '13px',
        border: isSelected ? '2px solid #007bff' : '1px solid lightgray'
      }}
    >
      <Card.Body>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div onClick={onClick} style={{ cursor: 'pointer', flexGrow: 1 }}>
            <Card.Title style={{ fontSize: '15px', marginBottom: 0 }}>
              {object.hidden ? '👻 ' : '🧩 '}
              {title}
            </Card.Title>
            {!isExpanded && (
              <div style={{ fontSize: '14px', marginTop: '8px', color: '#555' }}>
                📍 위치: ({object.x}, {object.y}) / 크기: {object.width}x{object.height}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              style={{ fontSize: '14px', padding: '2px 8px' }}
            >
              {isExpanded ? '▲ 닫기' : '▼ 열기'}
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ padding: '2px 8px', fontSize: '14px' }}
            >
              🗑 삭제
            </Button>
          </div>
        </div>

        {isExpanded && (
          <Form className="mt-2">
            <Row className="align-items-center">
              <Col xs={2}>
                <Form.Label style={{ fontSize: '14px' }}>X 좌표</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.x}
                  onChange={(e) => handleChange('x', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '14px' }}>Y 좌표</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.y}
                  onChange={(e) => handleChange('y', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '14px' }}>넓이</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.width}
                  onChange={(e) => handleChange('width', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '14px' }}>높이</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.height}
                  onChange={(e) => handleChange('height', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '14px' }}>회전</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.angle}
                  onChange={(e) => handleChange('angle', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '14px' }}>이동 방향</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.moveDirection}
                  onChange={(e) => handleChange('moveDirection', +e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col xs={3}>
                <Form.Check
                  type="switch"
                  id={`hide-switch-${object.index}`}
                  label={object.hidden ? '👻 숨겨진 상태' : '👁️ 보이는 상태'}
                  checked={!object.hidden}
                  onChange={() => handleChange('hidden', !object.hidden)}
                />
              </Col>
            </Row>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
}

export default ObjectControlPanel;