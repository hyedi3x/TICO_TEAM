import React, { useEffect, useState } from 'react';
import './Main.css';
import '../pages/chatbot/chatbotWindow.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import img1 from '../imgs/짱구1.jpg';
import ChatbotWindow from '../pages/chatbot/ChatbotWindow';
import ErpLogo from '../pages/erp/ErpLogo';
import ProjectCard from './ProjectCard';
import ProjectSelectModal from './ProjectSelectModal';

// 썸네일 URL 처리
const resolveThumbnailUrl = (url) => {
  if (url && !url.startsWith('http')) {
    return `http://localhost:8081${url}`;
  }
  return url || img1;
};

// 기본 카드 4개 슬롯 초기화
const getDefaultStaffPickProjects = () => [
  { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
  { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
  { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
  { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
];

function MainModify() {
  const [staffPickProjects, setStaffPickProjects] = useState(getDefaultStaffPickProjects());
  const [allProjects, setAllProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedStaffPickIndex, setSelectedStaffPickIndex] = useState(null);

  // 전체 프로젝트 목록
  useEffect(() => {
    fetch('http://localhost:8081/project/projectList')
      .then(res => res.json())
      .then(data => setAllProjects(data))
      .catch(err => console.error("전체 작품 목록 불러오기 실패", err));
  }, []);

  // 스태프 선정 목록 가져오기
  useEffect(() => {
    const userUuid = localStorage.getItem("user_uuid");

    fetch('http://localhost:8081/project/staffPick')
      .then(res => res.json())
      .then(pickData => {
        const newProjects = getDefaultStaffPickProjects();
        pickData.forEach(pick => {
          const matched = allProjects.find(p => Number(p.projectId) === Number(pick.projectId));
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
  }, [allProjects]);

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
    if (staffPickProjects.some(pick => pick.projectId === project.projectId)) {
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

      if (updated[selectedStaffPickIndex]) {
        updated[selectedStaffPickIndex] = newItem;
      } else {
        updated.push(newItem);
      }

      setStaffPickProjects(updated);
      handleCloseProjectModal();
    }
  };

  // 삭제
  const handleRemoveStaffPickProject = (index) => {
    fetch(`http://localhost:8081/project/staffPick/${index}`, {
      method: 'DELETE'
    })
      .then((res) => {
        if (!res.ok) throw new Error('삭제 실패');
        const updated = [...staffPickProjects];
        updated[index] = {
          projectId: null,
          thumbnailUrl: '',
          title: '등록해주세요',
          introduction: ''
        };
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

    fetch('http://localhost:8081/project/staffPick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (res.ok) alert("저장 완료!");
      })
      .catch(err => console.error("저장 실패:", err));
  };

  return (
    <div className='main-container'>
      {/* 상단 슬라이드 배너 */}
      <div className='sw'>
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          {[...Array(9)].map((_, i) => (
            <SwiperSlide key={i}>Slide {i + 1}</SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 스태프 선정 작품 */}
      <div className='maincon'>
        <div className='bt'>
          <h1 className="text-center fw-bold mb-4">스태프 선정 작품 등록하기</h1>
          <p className='p  mb-5'>⚠️ 작품을 추가하거나 변경한 후에는 반드시 <span className="text-success">"저장하기"</span> 버튼을 눌러야 적용됩니다. ⚠️</p>

          <div className="d-flex justify-content-end align-items-center gap-2">
            <Button variant="primary" onClick={handleAddStaffPick}>+ 추가하기</Button>
            <Button variant="success" onClick={handleSaveStaffPicks}>💾 저장하기</Button>
          </div>
        
         
          <Swiper
            slidesPerView={3}
            slidesPerGroup={1}
            spaceBetween={30}
            navigation={true}
            loop={false}
            modules={[Navigation]}
            className="staffSwiper mt-3"
          >
            {staffPickProjects.map((project, index) => (
              <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                <ProjectCard
                  project={project}
                  editable
                  onSelect={() => handleOpenProjectModal(index)}
                  onDelete={() => handleRemoveStaffPickProject(index)}
                  showStats={false}
                />
              </SwiperSlide>
            ))}
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
