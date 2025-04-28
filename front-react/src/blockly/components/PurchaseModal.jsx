import { Modal, Button } from 'rsuite';

function PurchaseModal({ show, onConfirm, onCancel }) {
  return (
    <Modal open={show} onClose={onCancel} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>이용권이 필요합니다</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        이 오브젝트는 유료입니다. 이용권을 구매하시겠습니까?
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="primary" onClick={onConfirm}>예</Button>
        <Button appearance="subtle" onClick={onCancel}>아니오</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PurchaseModal;
