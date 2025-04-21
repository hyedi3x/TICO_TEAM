import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Button, Modal, Form } from 'react-bootstrap';
import ProjectCard from './ProjectCard';
import ProjectSelectModal from './ProjectSelectModal';

const MainBannerManage = () => {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [form, setForm] = useState({
    bannerTitle: '',
    bannerImage: '',
    bannerLink: '',
    displayOrder: 1
  });

  const userUuid = localStorage.getItem("user_uuid");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const resolveThumbnailUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  };
  
  useEffect(() => {
    fetch('http://localhost:8081/banner/list')
      .then(res => res.json())
      .then(data => { setBanners(data); console.log(data) })
      .catch(err => console.error('배너 불러오기 실패:', err));
  }, []);

  const openModal = (index = null) => {
    setSelectedIndex(index);
    if (index !== null) {
      const banner = banners[index];
      setForm({
        bannerTitle: banner.bannerTitle,
        bannerImage: banner.bannerImage,
        bannerLink: banner.bannerLink,
        displayOrder: banner.displayOrder
      });
    } else {
      setForm({ bannerTitle: '', bannerImage: '', bannerLink: '', displayOrder: 1 });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8081/project/uploadImage', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 업로드 실패');
      }
      const { imageUrl } = await response.json();
      setForm(prev => ({ ...prev, bannerImage: imageUrl }));
      console.log("이미지url", imageUrl);

    } catch (err) {
      console.error('업로드 중 오류 발생:', err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleSave = () => {
    const payload = {
      ...form,
      empId: userUuid,
      bannerId: banners[selectedIndex]?.bannerId || null,
    };

    const url = 'http://localhost:8081/banner';
    const method = payload.bannerId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (res.ok) {
          alert('배너가 저장되었습니다.');
          window.location.reload();
        }
      })
      .catch(err => console.error("배너 저장 실패:", err));
  };

  const handleDelete = (bannerId, type = 'soft') => {
    const url = `http://localhost:8081/banner/${bannerId}` + (type === 'soft' ? '/soft' : '');
    const method = type === 'soft' ? 'PUT' : 'DELETE';

    fetch(url, { method })
      .then(res => {
        if (res.ok) {
          if (type === 'soft') {
            alert('배너가 삭제 처리되었습니다.');
            setBanners(prev => prev.map(b => b.bannerId === bannerId ? { ...b, isDelete: 'Y' } : b));
          } else {
            alert('배너가 영구 삭제되었습니다.');
            setBanners(prev => prev.filter(b => b.bannerId !== bannerId));
          }
        }
      })
      .catch(err => console.error('삭제 실패:', err));
  };

  const handleCancelDelete = (bannerId) => {
    fetch(`http://localhost:8081/banner/${bannerId}/recover`, { method: 'PUT' })
      .then(res => {
        if (res.ok) {
          alert('삭제가 취소되었습니다.');
          setBanners(prev => prev.map(b => b.bannerId === bannerId ? { ...b, isDelete: 'N' } : b));
        }
      })
      .catch(err => console.error('삭제 취소 실패:', err));
  };

  useEffect(() => {
    fetch('http://localhost:8081/project/projectList')
      .then(res => res.json())
      .then(data => setAllProjects(data))
      .catch(err => console.error("전체 작품 목록 불러오기 실패", err));
  }, []);

  const handleAddStaffPick = () => {
    setShowProjectModal(true);
  };

  const handleSelectProject = (project) => {
    const link = `/share/detail/${project.projectId}`;
    setForm(prev => ({ ...prev, bannerLink: link }));
    setShowProjectModal(false);
  };

  return (
    <div className="maincon">
      <h1 className="text-center fw-bold mb-4">메인 배너 관리</h1>
      <div className="d-flex justify-content-end gap-2 mb-3">
        <Button variant="primary" onClick={() => openModal(null)}>+ 배너 추가</Button>
      </div>

      <Swiper
        slidesPerView={5}
        navigation
        spaceBetween={30}
        modules={[Navigation]}
        className="staffSwiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
            <ProjectCard
              project={{
                projectId: banner.bannerId,
                title: banner.bannerTitle,
                introduction: banner.bannerLink,
                thumbnailUrl: resolveThumbnailUrl(banner.bannerImage)
              }}
              onSelect={() => openModal(index)}
              showStats={false}
              extraButtons={
                banner.isDelete === 'N' ? (
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openModal(index)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleDelete(banner.bannerId, 'soft')}
                    >
                      삭제
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleCancelDelete(banner.bannerId)}
                    >
                      삭제 취소
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-1"
                      onClick={() => handleDelete(banner.bannerId, 'hard')}
                    >
                      영구삭제
                    </Button>
                  </>
                )
              }
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedIndex !== null ? '배너 수정' : '배너 추가'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>배너 제목</Form.Label>
            <Form.Control name="bannerTitle" value={form.bannerTitle} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>이미지 업로드</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          </Form.Group>
          {form.bannerImage && (
            <div className="mb-2 text-center">
              <img
                src={`http://localhost:8081${form.bannerImage}`}
                alt="미리보기"
                style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
              />
            </div>
          )}
          <Form.Group className="mb-2">
            <Form.Label>링크 URL</Form.Label>
            <Button variant="primary" onClick={handleAddStaffPick}>+ 추가하기</Button>
            <Form.Control name="bannerLink" value={form.bannerLink} readOnly />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>순서</Form.Label>
            <Form.Control type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>취소</Button>
          <Button variant="primary" onClick={handleSave}>저장</Button>
        </Modal.Footer>
      </Modal>

      <ProjectSelectModal
        show={showProjectModal}
        onHide={() => setShowProjectModal(false)}
        onProjectSelect={handleSelectProject}
        projects={allProjects}
      />
    </div>
  );
};

export default MainBannerManage;
