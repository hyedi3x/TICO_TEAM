import { useEffect, useState } from 'react';
import { Container, Sidebar, Sidenav, Nav, Content, Header, ButtonGroup, Button, Modal, Form, Input, InputPicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './objectSelectPage.css';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// 아이콘
import { FaBug, FaCarSide, FaFileUpload, FaHome } from 'react-icons/fa';
import { PiDogFill, PiSelectionBackgroundFill, PiTextboxFill } from "react-icons/pi";
import { MdDraw, MdOutlineEmojiObjects } from 'react-icons/md';
import { RiPlantFill } from "react-icons/ri";
import { FaPerson } from 'react-icons/fa6';
import { IoFastFood } from 'react-icons/io5';
import { SiLinuxcontainers } from "react-icons/si";
import ObjectUploader from './ObjectUploader';
import ObjectDraw from './ObjectDraw';
import ObjectTextbox from './ObjectTextbox';
import PurchasePage from '../../mypage/PurchasePage';

// ObjectSelectPage.jsx
// 블록 오브젝트 선택 및 관리(등록, 수정, 삭제, 업로드 등)를 담당하는 메인 컴포넌트
// 관리자 권한 확인, 카테고리 선택, 파일 업로드/수정/삭제 등의 기능 포함

function ObjectSelectPage({ onComplete }) {
  // 상태 변수 선언
  const [selectedCategory, setSelectedCategory] = useState('사람');    // 선택된 카테고리
  const [objectList, setObjectList] = useState([]);                   // 전체 오브젝트 목록
  const [selectedObjects, setSelectedObjects] = useState([]);         // 선택된 오브젝트
  const [activeMode, setActiveMode] = useState('object');             // 모드 상태(object, upload, draw, textbox)
  const userUuid = localStorage.getItem("user_uuid");                 // 현재 로그인된 사용자 UUID
  const [showPurchasePageModal, setShowPurchasePageModal] = useState(false);  // 결제 페이지 모달로 띄우기

  // 구매 완료 여부 확인
  const location = useLocation();
  const purchased = location.state?.purchased || false;
  const [isPurchased, setIsPurchased] = useState(false);

  // 구매 완료 여부 확인
  const location = useLocation();
  const purchased = location.state?.purchased || false;
  const [isPurchased, setIsPurchased] = useState(false);

  // JWT 토큰에서 사용자 역할 추출 (EMPLOYEE인지 확인)
  const [userRole, setUserRole] = useState(null);  // 사용자 역할 상태
  const [userDepId, setUserDepId] = useState(null);  // 관리자 부서

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.userType);  // 예: EMPLOYEE, CUSTOMER
        setUserDepId(decoded.dep_Id);   // 예: DEP005(콘텐츠 담당자)
      } catch (error) {
        console.error("토큰 디코딩 실패:", error);
      }
    }
  }, []);


  // 오브젝트 목록 불러오기
  const fetchObjectList = () => {
    axiosInstance.get('/api/blockly-objects')
      .then(res => {
        const data = res.data;
        const result = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
        setObjectList(result);  // 등록 후 리 랜더링
      })
      .catch(err => {
        console.error("❌ 오브젝트 로딩 실패:", err);
        setObjectList([]);
      });
  };

  useEffect(fetchObjectList, []);

  // 구매 완료 상태를 저장해서 유료 오브젝트 락 해제를 해야함.
  useEffect(() => {
    if (purchased) {
      setIsPurchased(true);
    }
  }, [purchased]);

  // 구매 여부를 서버에서 확인
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!userUuid) return;
      try {
        const res = await axiosInstance.get(`/api/purchase/${userUuid}`);
        console.log('✅ 이용권 조회 결과:', res.data);

        // 예를 들어 서버에서 active: true 면 구매 완료라고 가정
        if (res.data.active) {
          setIsPurchased(true);
        } else {
          setIsPurchased(false);
        }
      } catch (error) {
        console.error('❌ 이용권 상태 확인 실패:', error);
        setIsPurchased(false);  // 실패했을 때는 잠겨있는 걸로 가정
      }
    };

    checkPurchaseStatus();
  }, [userUuid]);

  //--------------------------------[ 오브젝트 등록(관리자) ]-------------------------------------
  // 오브젝트 등록 모달 초기값 및 상태
  const initObj = {
    id: null,
    file: null,
    name: '',
    category: selectedCategory,
    description: '',
    previewUrl: '',
    blocklyObjectFilePath: '', // 수정 대비
  };

  const [showModal, setShowModal] = useState(false);  // 모달 open/close 상태
  const [newObjectData, setNewObjectData] = useState(initObj);
  const [mode, setMode] = useState("create"); // 등록 vs 수정 모드

  // 오브젝트 등록 처리
  const handleModalSubmit = () => {
    const { file, name, category, description } = newObjectData;
    if (!file || !name || !category) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_uuid", userUuid);
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("blocklyObjectPoint", newObjectData.blocklyObjectPoint ? "true" : "false");   // boolean값을 문자열로 바꿔서 백엔드에 넘기는 방식. @RequestParam으로 Boolean을 안정적으로 받기에 적합.

    axiosInstance.post("/api/blockly-objects/upload-object", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        alert("✅ 오브젝트 업로드 성공!");
        setShowModal(false);
        setNewObjectData(initObj);
        fetchObjectList(); // 새로 등록된 오브젝트 목록 재조회
        setActiveMode("object"); // 새로고침
      })
      .catch(err => {
        alert("❌ 업로드 실패");
        console.error(err);
      });
  };

  //--------------------------------[ 오브젝트 수정(관리자) ]----------------------------
  const handleEditClick = (object) => {
    setNewObjectData({
      id: object.blocklyObjectId,
      file: null,
      name: object.blocklyObjectName,
      category: object.blocklyObjectCategory,
      description: object.blocklyObjectDescription,
      previewUrl: '',
      blocklyObjectFilePath: object.blocklyObjectFilePath,
      blocklyObjectPoint: object.blocklyObjectPoint
    });
    setMode("edit");
    setShowModal(true);
  };

  const handleEditSubmit = () => {
    const { id, file, name, category, description } = newObjectData;

    if (!id || !name || !category) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("user_uuid", userUuid);
    formData.append("blocklyObjectPoint", newObjectData.blocklyObjectPoint ? "true" : "false");

    if (file) {
      formData.append("file", file);
    }

    axiosInstance.put(`/api/blockly-objects/update-object`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then(() => {
        alert("✅ 수정 성공!");
        setShowModal(false);
        setNewObjectData(initObj);
        fetchObjectList();
        setSelectedObjects([]);
        setMode("create");
      })
      .catch((err) => {
        alert("❌ 수정 실패");
        console.error("수정 오류:", err);
      });
  };

  //--------------------------------[ 오브젝트 삭제(관리자) ]----------------------------
  const handleDeleteObject = () => {
    if (selectedObjects.length === 0) {
      alert("삭제할 오브젝트를 선택해주세요!");
      return;
    }

    const names = selectedObjects.map(obj => obj.blocklyObjectName).join(", ");
    const confirmMessage =
      selectedObjects.length === 1
        ? `정말 "${names}" 오브젝트를 삭제하시겠습니까?`
        : `다음 ${selectedObjects.length}개의 오브젝트를 삭제하시겠습니까?\n\n${names}`;

    if (!window.confirm(confirmMessage)) return;

    // 단일 삭제
    if (selectedObjects.length === 1) {
      const id = selectedObjects[0].blocklyObjectId;
      axiosInstance.delete(`/api/blockly-objects/${id}`)
        .then(() => {
          alert("✅ 오브젝트 삭제 완료!");
          fetchObjectList();
          setSelectedObjects([]);
        })
        .catch(err => {
          alert("❌ 삭제 실패");
          console.error("삭제 오류:", err);
        });

      // 다중 삭제
    } else {
      const ids = selectedObjects.map(obj => obj.blocklyObjectId);
      axiosInstance.delete(`/api/blockly-objects/delete-multiple`, {
        data: ids,
      })
        .then(() => {
          alert("✅ 오브젝트들 삭제 완료!");
          fetchObjectList();
          setSelectedObjects([]);
        })
        .catch(err => {
          alert("❌ 일부 삭제 실패");
          console.error("삭제 오류:", err);
        });
    }
  };

  //--------------------------------[ 그 외의 핸들러 ]----------------------------
  //  카테고리 정의 및 필터링
  const categories = [
    { name: '사람', icon: <FaPerson /> },
    { name: '동물', icon: <PiDogFill /> },
    { name: '식물', icon: <RiPlantFill /> },
    { name: '탈것', icon: <FaCarSide /> },
    { name: '건물', icon: <FaHome /> },
    { name: '음식', icon: <IoFastFood /> },
    { name: '곤충', icon: <FaBug /> },
    { name: '물건', icon: <SiLinuxcontainers /> },
    { name: '배경', icon: <PiSelectionBackgroundFill /> },
  ];

  // 오브젝트 선택/해제 관련 핸들러
  const handleSelectObject = (obj) => {
    setSelectedObjects(prev => {
      const exists = prev.some(item => (item.id ?? item.blocklyObjectId) === (obj.id ?? obj.blocklyObjectId));
      if (exists) return prev;
      return [...prev, obj];
    });
  };

  const handleRemoveObject = (id) => {
    setSelectedObjects(prev =>
      prev.filter(obj => (obj.id ?? obj.blocklyObjectId) !== id)
    );
  };

  // 선택된 오브젝트를 캔버스로 전송
  const handleAddToCanvas = () => {
    if (selectedObjects.length === 0) {
      alert("오브젝트를 선택해주세요!");
      return;
    }
    onComplete(selectedObjects); // 👈 모달 부모로 선택 결과 전달
  };

  //--------------------------------[ 랜더링 ]----------------------------
  return (

    <Container className="objectSelectPage-container">

<Modal
  open={showPurchasePageModal}
  onClose={() => setShowPurchasePageModal(false)}
  size="sm"
  backdrop="static"
  keyboard={false}
>
  <Modal.Header>
    <Modal.Title>프리미엄 이용권 구매</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <PurchasePage
      goToStatus={() => {
        setShowPurchasePageModal(false);
        setIsPurchased(true);      // ✅ 결제 완료 후 락 해제
        fetchObjectList();         // ✅ 최신 오브젝트 목록 재로드
      }}
    />
  </Modal.Body>
</Modal>


      {/* 오브젝트 등록, 수정 모달창 */}
      <Modal open={showModal} onClose={() => {
        setShowModal(false);
        setNewObjectData({ file: null, name: '', category: selectedCategory, description: '', width: '', height: '' });
      }}>
        <Modal.Header>
          <Modal.Title>{mode === "create" ? "오브젝트 등록" : "오브젝트 수정"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid>
            <Form.Group controlId="file">
              <Form.ControlLabel>이미지</Form.ControlLabel>
              <div
                className="image-upload-preview"
                onClick={() => document.getElementById('hiddenFileInput').click()}
              >
                {newObjectData.previewUrl || newObjectData.blocklyObjectFilePath ? (
                  <img
                    src={
                      newObjectData.previewUrl
                        ? newObjectData.previewUrl
                        : `https://tico.kro.kr${newObjectData.blocklyObjectFilePath.startsWith('/') ? '' : '/'}${newObjectData.blocklyObjectFilePath}`
                    }
                    alt="오브젝트 미리보기"
                    className="image-preview-box"
                  />
                ) : (
                  <div className="image-placeholder">클릭하여 이미지 선택</div>
                )}
              </div>
              <input
                type="file"
                id="hiddenFileInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const previewUrl = URL.createObjectURL(file);
                    setNewObjectData((prev) => ({ ...prev, file, previewUrl }));
                  }
                }}
              />
            </Form.Group>

            <Form.Group controlId="name">
              <Form.ControlLabel>오브젝트 이름</Form.ControlLabel>
              <Input
                value={newObjectData.name}
                onChange={value => setNewObjectData(prev => ({ ...prev, name: value }))}
              />
            </Form.Group>
            <Form.Group controlId="blocklyObjectPoint">
              <Form.ControlLabel>유료 오브젝트 여부</Form.ControlLabel>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={newObjectData.blocklyObjectPoint || false}
                  onChange={(e) =>
                    setNewObjectData((prev) => ({ ...prev, blocklyObjectPoint: e.target.checked }))
                  }
                />
                유료로 설정
              </label>
            </Form.Group>
            <Form.Group controlId="category">
              <Form.ControlLabel>카테고리</Form.ControlLabel>
              <InputPicker
                data={categories.map(c => ({ label: c.name, value: c.name }))}
                value={newObjectData.category}
                onChange={value => setNewObjectData(prev => ({ ...prev, category: value }))}
                block
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.ControlLabel>설명</Form.ControlLabel>
              <Input
                as="textarea"
                rows={3}
                value={newObjectData.description}
                onChange={value => setNewObjectData(prev => ({ ...prev, description: value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="primary" onClick={mode === "create" ? handleModalSubmit : handleEditSubmit}>
            {mode === "create" ? "등록" : "수정"}
          </Button>
          <Button onClick={() => {
            setShowModal(false)
            setNewObjectData(initObj);  // 초기화
          }}
          >
            취소</Button>
        </Modal.Footer>
      </Modal>

      {/* 왼쪽 사이드바 카테고리 */}
      <Sidebar width={160} className="objectSelectPage-category-sidebar">
        <Sidenav appearance="subtle">
          <Sidenav.Body>
            <Nav activeKey={selectedCategory} onSelect={setSelectedCategory}>
              {categories.map(category => (
                <Nav.Item key={category.name} eventKey={category.name} icon={<span style={{ marginRight: '5px' }}>{category.icon}</span>}>
                  {category.name}
                </Nav.Item>
              ))}
            </Nav>
          </Sidenav.Body>
        </Sidenav>
      </Sidebar>

      <Container>
        <Header className="objectSelectPage-toolbar">
          {/* 상단 모드 전환 버튼 */}
          <ButtonGroup>
            <Button
              appearance="default"
              startIcon={<MdOutlineEmojiObjects />}
              onClick={() => setActiveMode('object')}
              className={activeMode === 'object' ? 'objectSelectPage-active-toolbar-btn' : ''}
            >
              오브젝트 선택
            </Button>

            {/* 관리자(EMPLOYEE) + 콘텐츠팀(MO)이 아니면 파일올리기/그리기/글상자 보여주기 */}
            {!(userRole === 'EMPLOYEE' && userDepId === 'DEP005') && (
              <>
                <Button
                  appearance="default"
                  startIcon={<FaFileUpload />}
                  onClick={() => setActiveMode('upload')}
                  className={activeMode === 'upload' ? 'objectSelectPage-active-toolbar-btn' : ''}
                >
                  파일 올리기
                </Button>
                <Button
                  appearance="default"
                  startIcon={<MdDraw />}
                  onClick={() => setActiveMode('draw')}
                  className={activeMode === 'draw' ? 'objectSelectPage-active-toolbar-btn' : ''}
                >
                  새로 그리기
                </Button>
                <Button
                  appearance="default"
                  startIcon={<PiTextboxFill />}
                  onClick={() => setActiveMode('textbox')}
                  className={activeMode === 'textbox' ? 'objectSelectPage-active-toolbar-btn' : ''}
                >
                  글상자
                </Button>
              </>
            )}
          </ButtonGroup>

          {/* 관리자 전용 등록/수정/삭제 버튼 */}
          {userRole === 'EMPLOYEE' && userDepId === 'DEP005' && (
            <div className="objectSelectPage-admin-controls">
              <Button appearance="primary" size="sm" color="green" onClick={() => { setMode("create"); setNewObjectData(initObj); setShowModal(true); }}>➕ 등록</Button>
              <Button appearance="ghost" size="sm" color="blue" onClick={() => selectedObjects.length === 1 ? handleEditClick(selectedObjects[0]) : alert("하나의 오브젝트를 선택해주세요!")}>✏️ 수정</Button>
              <Button appearance="ghost" size="sm" color="red" onClick={handleDeleteObject}>🗑️ 삭제</Button>
            </div>
          )}
        </Header>

        {/* 중앙 콘텐츠 영역 */}
        <Content className="objectSelectPage-grid-container">
          {/* 오브젝트 선택 */}
          {activeMode === 'object' && (
            <div className="objectSelectPage-grid">
              {objectList
                .filter(obj => obj.blocklyObjectCategory === selectedCategory)
                .map(obj => {
                  const isPaid = obj.blocklyObjectPoint === true;
                  const isAdmin = userRole === 'EMPLOYEE' && userDepId === 'DEP005';

                  return (
                    <div
                      key={obj.blocklyObjectId}
                      className={`objectSelectPage-item ${(isPaid && !isPurchased && !isAdmin) ? 'locked' : ''}`}
                      onClick={() => {
                        if (isPaid && !isPurchased && !isAdmin) {
                          setShowPurchasePageModal(true); // ✅ 결제 페이지 모달 띄움
                          return;
                        }
                        handleSelectObject(obj);         // 무료거나 결제했으면 바로 선택
                      }}
                      title={obj.blocklyObjectName}
                    >
                      <div className="objectSelectPage-image-wrapper" style={{ position: 'relative' }}>
                        <img
                          src={`https://tico.kro.kr${obj.blocklyObjectFilePath.startsWith('/') ? '' : '/'}${obj.blocklyObjectFilePath}`}
                          alt={obj.blocklyObjectName}
                          className="objectSelectPage-image"
                        />
                        {(isPaid && !isPurchased && !isAdmin) && (
                          <div className="lock-overlay">🔒</div>
                        )}  {/* 결제 되었으면 자물쇠풀림 */}
                      </div>
                      <div className="objectSelectPage-name">{obj.blocklyObjectName}</div>
                    </div>
                  );
                })}
            </div>
          )}
          {/* 모듈화된 모드 컴포넌트 */}
          {activeMode === 'upload' && (
            <ObjectUploader onSelect={handleSelectObject} fileInputId="uploadHiddenInput" />
          )}

          {activeMode === 'draw' && (
            <ObjectDraw onComplete={setSelectedObjects} />
          )}
          {activeMode === 'textbox' && (
            <ObjectTextbox
              onComplete={(textObjects) => {
                if (!Array.isArray(textObjects) || textObjects.length === 0) return;

                setSelectedObjects(prev => {
                  const newObjects = textObjects.filter(newObj =>
                    !prev.some(obj => obj.id === newObj.id)
                  );
                  return [...prev, ...newObjects];
                });
              }}
            />
          )}
        </Content>
      </Container>

      {/* 우측 선택된 오브젝트 목록 */}
      <div className="objectSelectPage-right-selected">
        {/* 관리자일 때 추가하기 버튼 숨기기 */}
        {!(userRole === 'EMPLOYEE' && userDepId === 'DEP005') && (
          <div className="objectSelectPage-add-button-container">
            <Button appearance="primary" size="sm" onClick={handleAddToCanvas}>➕ 추가하기</Button>
          </div>
        )}
        <h6 className="objectSelectPage-select-title">🧺 선택된 오브젝트</h6>
        {selectedObjects.length === 0 ? (
          <p className="objectSelectPage-empty-text">선택된 항목이 없습니다.</p>
        ) : (
          <div className="objectSelectPage-selected-object-list">
            {selectedObjects.map(obj => (
              <div
                key={`${obj.source || obj.type || 'default'}_${obj.id || obj.blocklyObjectId}`}
                className="objectSelectPage-selected-object-item"
                onClick={() => handleRemoveObject(obj.id || obj.blocklyObjectId)}
              >

                {/* 🖼️ 타입이 image인 경우 */}
                {obj.type === 'image' || obj.blocklyObjectFilePath ? (
                  <img
                    src={`https://tico.kro.kr${obj.blocklyObjectFilePath.startsWith('/') ? '' : '/'}${obj.blocklyObjectFilePath}`}
                    alt={obj.blocklyObjectName}
                    className="objectSelectPage-selected-object-image"
                  />
                ) : obj.type === 'text' ? (
                  <div
                    className="objectSelectPage-textbox-preview"
                    style={{
                      fontSize: obj.fontSize,
                      fontFamily: obj.fontFamily,
                      color: obj.color,
                      margin: '0 auto',
                    }}
                  >
                    {obj.text}
                  </div>
                ) : null}

                <div className="objectSelectPage-selected-object-name">
                  {obj.blocklyObjectName || obj.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

export default ObjectSelectPage;