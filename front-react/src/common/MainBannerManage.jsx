import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import './MainBannerManage.css';
import { Navigation } from 'swiper/modules';
// ✨ 아래 4개만 rsuite로
import { Modal, Button, Form, Input, InputNumber } from 'rsuite';
import ProjectCard from './ProjectCard';
import ProjectSelectModal from './ProjectSelectModal';
import axiosInstance from '../pages/login/social/utils/axiosInstance';

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
  // 이미지 요청
  const resolveThumbnailUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  };

  // 전체 작품 불러오기
  useEffect(() => {
    axiosInstance.get('/api/project/projects')
    .then(response => {
      setAllProjects(response.data);
    })
    .catch(err => console.error("전체 작품 목록 불러오기 실패", err));
  }, []);

  // 배너 목록 가져오기
  useEffect(() => {
    axiosInstance.get('/api/banner/list')
    .then(response => {
      setBanners(response.data);
      console.log(response.data);
    })
    .catch(err => console.error('배너 불러오기 실패:', err));
  }, []);

  // 배너 추가, 수정 열기
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
      setForm({ bannerTitle: '', bannerImage: '', bannerLink: '', displayOrder: banners.length+1 });
    }
    setShowModal(true);
  };

  // ✨ RSuite FormControl 대응 (각 폼 컨트롤마다 onChange 분리)
  const handleBannerTitleChange = (value) => {
    setForm(prev => ({ ...prev, bannerTitle: value }));
  };

  const handleBannerLinkChange = (value) => {
    setForm(prev => ({ ...prev, bannerLink: value }));
  };

  const handleDisplayOrderChange = (value) => {
    setForm(prev => ({ ...prev, displayOrder: value }));
  };

  // 모달 폼에서 이미지 등록
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axiosInstance.post('/api/project/uploadImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 전송 시 필요한 헤더
        },
      });
      if (response.status !== 200) {
        throw new Error('이미지 업로드 실패');
      }
      const { imageUrl } = response.data;  // ✅ axios는 자동으로 JSON 파싱함
      setForm(prev => ({ ...prev, bannerImage: imageUrl }));
      console.log("이미지url", imageUrl);
    } catch (err) {
      console.error('업로드 중 오류 발생:', err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  // 등록 또는 수정
  const handleSave = () => { // 저장할 때 등록자와 배너 아이디 추가
    if (!form.bannerTitle || !form.bannerLink || !form.displayOrder || !form.bannerImage) {
      alert('모든 필드를 채워주세요.');
      return; // 빈 필드가 있으면 저장하지 않음
    }
    const payload = {
      ...form,
      empId: userUuid,
      bannerId: banners[selectedIndex]?.bannerId || -1, // -1로 가면 등록, 있으면 수정
    };

    const url = '/api/banner';
    const method = payload.bannerId ==-1 ? 'PUT' : 'POST';

    axiosInstance({
      method,
      url,
      headers: { 'Content-Type': 'application/json' },
      data: payload, // axios에서는 'body' 대신 'data'를 사용합니다.
    })
      .then(res => {
        if (res.status === 200) {
          // 상태 업데이트: 서버에서 저장된 데이터에 따라 상태를 갱신
          setBanners(prevBanners => {
            const updatedBanners = [...prevBanners];
            if (payload.bannerId === -1) {
              updatedBanners.push({ ...payload, isDelete: 'N' }); // 새 배너 추가, 삭제 여부를 명시적으로 설정
            } else {
              updatedBanners[selectedIndex] = { ...payload, isDelete: 'N' }; // 기존 배너 수정
            }
            return updatedBanners;
          });
          alert('배너가 저장되었습니다.'); 
          setShowModal(false);
        }
      }) 
      .catch(err => console.error("배너 저장 실패:", err));
  };

  // 삭제 또는 영구삭제
  const handleDelete = (bannerId, type) => {
    if(type=='hard' && !window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    const url = `/api/banner/${bannerId}` + (type === 'soft' ? '/soft' : ''); // 타입을 경로로 만든다
    const method = type === 'soft' ? 'PUT' : 'DELETE';

    axiosInstance({
      method,  // 변수명이 동일하여 method만 전달
      url,
    })
      .then(res => {
        if (res.status === 200) {
          if (type === 'soft') { // 실시간 변경
            setBanners(prev => prev.map(before => before.bannerId === bannerId ? { ...before, isDelete: 'Y' } : before));
          } else {
            alert('배너가 영구 삭제되었습니다.');
            setBanners(prev => prev.filter(before => before.bannerId !== bannerId));
          }
        }
      })
      .catch(err => console.error('삭제 실패:', err));
  };

  // 삭제취소
  const handleCancelDelete = (bannerId) => {
    axiosInstance.put(`/api/banner/${bannerId}/recover`)
    .then(res => {
      if (res.status === 200) {
        setBanners(prev => prev.map(b => b.bannerId === bannerId ? { ...b, isDelete: 'N' } : b));
      }
    })
    .catch(err => console.error('삭제 취소 실패:', err));
  };

  // 등록 모달 -> 작품 리스트 모달
  const handleAddStaffPick = () => {
    setShowProjectModal(true);
  };

  // 모달 내부 작품 선택하면 링크를 설정하고 닫음 
  const handleSelectProject = (project) => {
    const bannerLink = `/share/detail/${project.projectId}`;
    setForm(prev => ({ ...prev, bannerLink: bannerLink }));
    setShowProjectModal(false);
  };

  return (
    <> {/*MainModify의 자식요소로 들어가게 된다*/}
      <div className="notice-title mt-3">🎞️ 메인 배너 관리</div>
      <div className="d-flex justify-content-end gap-2 mb-2">
      <button className="faq-btn add-button" onClick={() => openModal(null)}>+ 배너 추가</button>
      </div>

      <Swiper
        slidesPerView={4}
        slidesPerGroup={1}
        navigation
        modules={[Navigation]}
        className="staffSwiper mt-3"
        breakpoints={{
          3000: {
            slidesPerView: 4,
          },
          1500: {
            slidesPerView: 3,
          },
          1300: {
            slidesPerView: 2,
          },
          800: {
            slidesPerView: 1,
          },

        }}
      >
        {banners.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center w-100" style={{ height: "430px" }}>
            <h5>스태프 선정 작품을 등록해주세요</h5>
          </div>
        ) : (
          banners.map((banner, index) => (
            <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
              <ProjectCard
                project={{
                  projectId: banner.bannerId,
                  title: banner.bannerTitle,
                  bannerLink: banner.bannerLink,
                  thumbnailUrl: resolveThumbnailUrl(banner.bannerImage),
                  likeCount : banner.likeCount,
                  bookMarkCount : banner.bookMarkCount,
                  viewCount : banner.viewCount,
                }}
                onSelect={() => openModal(index)}
                showStats={false}
                extraButtons={
                  banner.isDelete === 'N' ? (
                    <>
                      <button className="faq-btn btn-edit" onClick={() => openModal(index)}>수정</button>
                      <button className=" faq-btn btn-delete" onClick={() => handleDelete(banner.bannerId, 'soft')}>삭제</button>
                    </>
                  ) : (
                    <>
                      <button className="faq-btn add-button" onClick={() => handleCancelDelete(banner.bannerId)}>삭제취소</button>
                      <button className="faq-btn btn-delete" onClick={() => handleDelete(banner.bannerId, 'hard')}>영구삭제</button>
                    </>
                  )
                }
              />
            </SwiperSlide>
          ))
        )}
      </Swiper>


      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>{selectedIndex !== null ? '배너 수정' : '배너 추가'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form fluid>
          <Form.Group className="mb-2">
            <Form.ControlLabel>배너 제목</Form.ControlLabel>
            <Input
              name="bannerTitle"
              value={form.bannerTitle}
              onChange={handleBannerTitleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Form.ControlLabel style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
              이미지 업로드
            </Form.ControlLabel>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button
                appearance="primary"
                style={{ position: 'relative', zIndex: 1 }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                파일 선택
              </Button>
              <input
                id="file-upload-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  zIndex: 2
                }}
              />
            </div>
            {/* 선택된 파일명 출력 */}
            <span style={{ marginLeft: 10, fontSize: 13 }}>
              {form.bannerImage ? form.bannerImage.split('/').pop() : '선택된 파일 없음'}
            </span>
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
            <Form.ControlLabel>링크 URL</Form.ControlLabel>
            <Button appearance="primary" onClick={handleAddStaffPick} style={{ marginBottom: 6 }}>
              + 추가하기
            </Button>
            <Input
              name="bannerLink"
              value={form.bannerLink}
              onChange={handleBannerLinkChange}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.ControlLabel>순서</Form.ControlLabel>
            <InputNumber
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleDisplayOrderChange}
            />
          </Form.Group>
        </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" onClick={() => setShowModal(false)}>취소</Button>
          <Button appearance="primary" onClick={handleSave}>저장</Button>
        </Modal.Footer>
      </Modal>

      <ProjectSelectModal
        show={showProjectModal}
        onHide={() => setShowProjectModal(false)}
        onProjectSelect={handleSelectProject}
        projects={allProjects}
      />
    </>
  );
};

export default MainBannerManage;
