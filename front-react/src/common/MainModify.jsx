import React, { useEffect, useState } from 'react';
import './Main.css';
import '../pages/chatbot/chatbotWindow.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Button } from 'rsuite';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatbotWindow from '../pages/chatbot/ChatbotWindow';
import ErpLogo from '../pages/erp/ErpLogo';
import ProjectCard from './ProjectCard';
import ProjectSelectModal from './ProjectSelectModal';
import MainBannerManage from './MainBannerManage';
import axios from 'axios';
import axiosInstance from '../pages/login/social/utils/axiosInstance';

function MainModify() {
  const [staffPickProjects, setStaffPickProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedStaffPickIndex, setSelectedStaffPickIndex] = useState(null);

  // 전체 프로젝트 목록
  useEffect(() => {
    axiosInstance.get('/api/project/projects')
    .then(response => {
      setAllProjects(response.data);
    })
    .catch(err => console.error("전체 작품 목록 불러오기 실패", err));
  }, []);

  // 스태프 선정 목록 가져와서 전체 목록 중에서 화면에 표시하기
  useEffect(() => {
    const userUuid = localStorage.getItem("user_uuid");

    axiosInstance.get('/api/project/staffPick')
    .then(response => {
      const pickData = response.data;
        const newProjects = [];
        pickData.forEach(pick => {
          const matched = allProjects.find(all => Number(all.projectId) === Number(pick.projectId));
          if (matched) {
            newProjects[pick.slotIndex] = {
              projectId: matched.projectId,
              thumbnailUrl: matched.thumbnailUrl,
              title: matched.title,
              introduction: matched.introduction,
              userUuid,
              slotIndex: pick.slotIndex
            };
          }
        });
        setStaffPickProjects(newProjects);
      });
  }, [allProjects]); // 마운트 시점에 전체 목록 가져온 후 선정 목록 가져오기

  // 모달 열기
  const handleOpenProjectModal = (index) => {
    setSelectedStaffPickIndex(index);
    setShowProjectModal(true);
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setSelectedStaffPickIndex(null);
  };

  // 새 항목 추가
  const handleAddStaffPick = () => {
    const newSlotIndex = staffPickProjects.length;
    setSelectedStaffPickIndex(newSlotIndex);
    setShowProjectModal(true);
  };

  // 작품 선택
  const handleSelectProject = (project) => {
    // 이미 등록된 작품인지 확인
    if (staffPickProjects.some(pick => pick.projectId === project.projectId && pick.projectId !== null)) {
      alert("이미 등록된 작품입니다.");
      return;
    }
  
    if (selectedStaffPickIndex !== null) {
      const updated = [...staffPickProjects];
      const newItem = {
        projectId: project.projectId,
        thumbnailUrl: project.thumbnailUrl,
        title: project.title,
        introduction: project.introduction,
        slotIndex: selectedStaffPickIndex
      };
  
      updated[selectedStaffPickIndex] = newItem; // 해당 슬롯에 작품 추가
      setStaffPickProjects(updated);  // 상태 업데이트
      handleCloseProjectModal();  // 모달 닫기
    }
  };

  // 삭제
  const handleRemoveStaffPickProject = (projectId) => {
    axiosInstance.delete(`/api/project/staffPick/${projectId}`)
      .then((res) => {
        console.log(res);
        // staffPickProjects 배열에서 해당 항목을 제거하고 나머지 항목을 당김
        const updated = staffPickProjects.filter(project => project.projectId !== projectId);
        setStaffPickProjects(updated);
        alert('삭제 완료!');
      })
      .catch(err => {
        console.error("삭제 실패:", err);
        alert('삭제에 실패했습니다.');
      });
  };

  // 저장
  const handleSaveStaffPicks = () => {
    const userUuid = localStorage.getItem("user_uuid");
    const payload = staffPickProjects
      .filter(p => p.projectId !== null)
      .map(item => ({
        slotIndex: item.slotIndex,
        projectId: item.projectId,
        userUuid
      }));

      axiosInstance.post('/api/project/staffPick', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => {
        alert("저장 완료!");
      })
      .catch(err => console.error("저장 실패:", err));
  };

  return (

    <div className='main-modify-container' style={{minWidth: '1060px'}}>
      {/* MainBannerManage 컴포넌트 추가 */}
      <MainBannerManage />

      {/* 스태프 선정 작품 */}
      <div className='maincon mt-5'>
        <div className='bt'>
          <div className="faq-title mb-2">🎞️ 스태프 선정 작품 관리</div>
          <p className='p mb-2'>⚠️ 작품을 추가하거나 변경한 후에는 반드시 <span className="faq-btn btn-edit">저장하기</span> 버튼을 눌러야 적용됩니다. ⚠️</p>

          <div className="d-flex justify-content-end align-items-center gap-2">
            <button className="faq-btn add-button" onClick={handleAddStaffPick}>+ 추가하기</button>
            <button className="faq-btn btn-edit" onClick={handleSaveStaffPicks}>💾 저장하기</button>
          </div>
        
         
          <Swiper
            slidesPerView={4}
            slidesPerGroup={1}
            navigation={true}
            modules={[Navigation]}
            className="staffSwiper mt-3"
            breakpoints={{
              1500: {
                slidesPerView: 4,
              },
              1000: {
                slidesPerView: 3,
              },
              500: {
                slidesPerView: 2,
              },
              300: {
                slidesPerView: 1,
              },
            }}
          >
            {staffPickProjects.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center w-100" style={{ height: "430px" }}>
                <h5>스태프 선정 작품을 등록해주세요</h5>
              </div>
            ) : (
              staffPickProjects.filter(project => project.projectId).map((project, index) => (
                <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                  <ProjectCard
                    project={project}
                    editable = {
                      <>
                        <button className="faq-btn btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProjectModal(index);
                          }}
                        >
                          수정
                        </button>
                        <button className="faq-btn btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStaffPickProject(project.projectId);
                          }}
                        >
                          삭제
                        </button>
                      </>
                    }
                    showStats={false}
                  />
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
      </div>

      {/* 작품 선택 모달 */}
      <ProjectSelectModal
        show={showProjectModal}
        onHide={handleCloseProjectModal}
        onProjectSelect={handleSelectProject}
        projects={allProjects}
      />
    </div>
  );
}

export default MainModify;
