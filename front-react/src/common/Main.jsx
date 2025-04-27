// src/components/Main.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

// 스타일
import "./Main.css";
import "../pages/wep_chat/wepChat.css";
import "../pages/chatbot/chatbotWindow.css";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Bootstrap
import { Card, Col, Row, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// 챗 컴포넌트
import WepChat from "../pages/wep_chat/WepChat";
import ChatbotWindow from "../pages/chatbot/ChatbotWindow";
import ErpLogo from "../pages/erp/ErpLogo";
import ProjectCard from "./ProjectCard";
import axios from "axios";
import axiosInstance from "../pages/login/social/utils/axiosInstance";

function Main() {
  const [userRole, setUserRole] = useState(null);
  const [staffPickProjects, setStaffPickProjects] = useState([]);
  const [popularProjects, setPopularProjects] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // ⭐ 로딩 상태 추가
  const navigate = useNavigate();
  
  // 로그인 유저 정보 추출
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.userType);
      } catch (error) {
        console.error("토큰 디코딩 실패:", error);
      }
    }
  }, []);

  // 모든 데이터 한 번에 불러오기 (병렬)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projectsRes, picksRes, popRes, bannerRes] = await Promise.all([ 
          // Promise.all로 모든 요청 기다림, 요청결과를 배열로 담고 모든 요청을 기다린다.
          // 배열 구조분해 할당을 사용해 순서대로 요청 결과가 담긴다.
          axiosInstance.get('/api/project/projectList'),
          axiosInstance.get('/api/project/staffPick'),
          axiosInstance.get('/api/project/popularProjects'),
          axiosInstance.get('/api/banner/list')
        ]);
        // 모든 프로젝트
        const allProjects = projectsRes.data;
        // 스선
        const staffPicks = picksRes.data.map(pick => {
          const matched = allProjects.find(p => Number(p.projectId) === Number(pick.projectId));
          return matched ? {
            projectId: matched.projectId,
            thumbnailUrl: matched.thumbnailUrl,
            title: matched.title,
            introduction: matched.introduction,
            slotIndex: pick.slotIndex
          } : null;
        }).filter(Boolean); //filter(Boolean)은 true가 되는 값만 남긴다 (null, undefinded도 걸러줌)
        setStaffPickProjects(staffPicks);
        // 인작
        setPopularProjects(popRes.data.slice(0, 10));
        // banner
        setBanners(bannerRes.data.sort((a, b) => a.displayOrder - b.displayOrder));
        // 로딩 완료
        setIsLoaded(true);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
      }
    };
    fetchAll();
  }, []);

  // 이미지 경로 처리
  const resolveThumbnailUrl = (url) => {
    if (url && !url.startsWith('http')) {
      return `https://tico.kro.kr${url}`;
    }
    return url;
  };

  // staffPick, popular id 배열 (태그 조건용)
  const staffPickIds = staffPickProjects.map(p => Number(p.projectId));
  const popularIds = popularProjects.map(p => Number(p.projectId));

  // ⭐ 로딩중 처리
  if (!isLoaded) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩중...</div>;
  }
  return (
    <div className='main-wrapper'>
      {/* ── 유저간 채팅 ── */}
      {userRole !== "EMPLOYEE" && (
        <div className="chat-side-panel">
          <WepChat />
        </div>
      )}

      <div className='main-container' style={{ minWidth: '1060px' }}>
        {/* ── 스와이퍼 영역 ── */}
        <div className='sw'>
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={true}
            loop={true}
            speed={1000}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >
            {banners.length === 0 ? (
              <SwiperSlide>
                <div className="d-flex align-items-center justify-content-center w-100" style={{ height: "430px" }}>
                  <h2>배너가 없습니다. 등록해주세요.</h2>
                </div>
              </SwiperSlide>
            ) : (
              banners.map((banner, index) => (
                <SwiperSlide key={index} onClick={() => navigate(banner.bannerLink)}>
                  <div style={{ position: 'relative', maxHeight: '430px' }}>
                    <img
                      src={resolveThumbnailUrl(banner.bannerImage)}
                      alt={banner.bannerTitle}
                      style={{ width: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '5px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}
                    >
                      {banner.bannerTitle}
                    </div>
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>

        {/* ── 스태프 선정 작품 ── */}
        <div className='bt'>
          <h1 className='h1'>스태프 선정 작품</h1>
          <p className='p'>창의적이고 완성도가 높은 작품을 스태프가 직접 뽑아 소개해요.</p>

          <Swiper
            slidesPerView={4}
            slidesPerGroup={1}
            spaceBetween={30}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            navigation={true}
            loop={true}
            modules={[Autoplay, Navigation]}
            className="staffSwiper mt-3"
          >
            {staffPickProjects.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center w-100" style={{ height: "430px" }}>
                <h2>스태프 선정 작품이 없습니다. 등록해주세요.</h2>
              </div>
            ) : (
              staffPickProjects.map((project, index) => (
                <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                  <ProjectCard
                    project={project}
                    onClick={() => navigate(`/share/detail/${project.projectId}`)}
                    showStats={false}
                    isStaff={staffPickIds.includes(Number(project.projectId))}
                    isPopular={popularIds.includes(Number(project.projectId))}
                  />
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>

        {/* ── 인기 작품 ── */}
        <div className="bt1">
          <h1>인기 작품</h1>
          <p>티코미들에게 이 작품들이 최근 주목 받고 있어요!</p>
          <Swiper
            slidesPerView={4}
            slidesPerGroup={1}
            spaceBetween={30}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            navigation={true}
            loop={true}
            modules={[Autoplay, Navigation]}
            className="staffSwiper mt-3"
          >
            {popularProjects.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center w-100" style={{ height: "430px" }}>
                <h2>인기 작품이 없습니다. 등록해주세요.</h2>
              </div>
            ) : (
              popularProjects.map((project, index) => (
                <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                  <ProjectCard
                    project={project}
                    onClick={() => navigate(`/share/detail/${project.projectId}`)}
                    isStaff={staffPickIds.includes(Number(project.projectId))}
                    isPopular={popularIds.includes(Number(project.projectId))}
                  />
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>

        {/* ── ERP 로고 or 챗봇 ── */}
        <div>
          {userRole === 'EMPLOYEE' ? (
            <ErpLogo visible={true} />
          ) : (
            <ChatbotWindow />
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;
