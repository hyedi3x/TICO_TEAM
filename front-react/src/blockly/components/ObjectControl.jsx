import React from 'react';
import { Form, Row, Col, Card, Button } from 'react-bootstrap';

function ObjectControlPanel({  object, onUpdate, i, onDelete, isSelected, onClick  }) {
  if (!object) return null;

  const handleChange = (field, value) => {
    onUpdate({ ...object, [field]: value });
  };

  return (
    <Card
      style={{
        width: '100%',
        fontSize: '13px',
        border: isSelected ? '2px solid #007bff' : '1px solid lightgray',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <Card.Body>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Card.Title style={{ fontSize: '15px', marginBottom: 0 }}>
            {object.hidden ? '👻 ' : '🧩 '}
            {i + 1}번째 오브젝트 속성(index : {object.index})
          </Card.Title>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // 카드 전체 클릭 방지
              onDelete();
            }}
            style={{ padding: '2px 8px', fontSize: '12px' }}
          >
            🗑 삭제
          </Button>
        </div>

        {/* 👇 선택된 경우에만 속성 펼치기 */}
        {isSelected && (
          <Form className="mt-2">
            <Row className="align-items-center">
              <Col xs={2}>
                <Form.Label style={{ fontSize: '12px' }}>X 좌표</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.x}
                  onChange={(e) => handleChange('x', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '12px' }}>Y 좌표</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.y}
                  onChange={(e) => handleChange('y', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '12px' }}>넓이</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.width}
                  onChange={(e) => handleChange('width', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '12px' }}>높이</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.height}
                  onChange={(e) => handleChange('height', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '12px' }}>회전</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.angle}
                  onChange={(e) => handleChange('angle', +e.target.value)}
                />
              </Col>
              <Col xs={2}>
                <Form.Label style={{ fontSize: '12px' }}>이동 방향</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={object.moveDirection}
                  onChange={(e) => handleChange('moveDirection', +e.target.value)}
                />
              </Col>
            </Row>
            {/* 👇 숨기기 / 보이기 스위치 추가 */}
            <Row className="mt-2">
              <Col xs={12}>
                <Form.Check
                  type="switch"
                  id={`hide-switch-${object.index}`}
                  label={object.hidden ? '👻 숨겨진 상태' : '👁 보이는 상태'}
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
