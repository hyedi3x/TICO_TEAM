// src/components/Main.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// 스타일
import "./Main.css";
import "../pages/wep_chat/wepChat.css";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Bootstrap
import { Card, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// 이미지
import img1 from "../imgs/짱구1.jpg";

// 챗 컴포넌트
import WepChat from "../pages/wep_chat/WepChat";
import ChatbotWindow from "../pages/chatbot/ChatbotWindow";
import ErpLogo from "../pages/erp/ErpLogo";

export default function Main() {
  const [userRole, setUserRole] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const { userType } = jwtDecode(token);
        setUserRole(userType);
      } catch {}
    }
  }, []);

  const toggleChat = () => setShowChat((v) => !v);

  return (
    <div className="main-wrapper">
      {/* ── 유저간 채팅 ── */}
      {userRole !== "EMPLOYEE" && (
        <div className="chat-side-panel">
          <WepChat />

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './Main.css';
import '../pages/chatbot/chatbotWindow.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Card, Col, Row, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatbotWindow from '../pages/chatbot/ChatbotWindow';
import ErpLogo from '../pages/erp/ErpLogo';
import ProjectCard from './ProjectCard';
import axios from 'axios';

function Main() {
  const [userRole, setUserRole] = useState(null);
  const [staffPickProjects, setStaffPickProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [popularProjects, setPopularProjects] = useState([]);
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.userType);
      } catch (error) {
        console.error("토큰 디코딩 실패:", error);
      }
    }
  }, []);

  // 인기 작품은 10개
  useEffect(() => {
    axios.get('http://localhost:8081/project/popularProjects')
  .then(response => {
    const popData = response.data.slice(0, 10);
    setPopularProjects(popData);
  })
  .catch(err => console.error("인기 작품 불러오기 실패:", err));
  }, []);

  // 배너 목록 가져오기
  useEffect(() => {
    axios.get('http://localhost:8081/banner/list')
  .then(response => {
    setBanners(response.data.sort((a, b) => a.displayOrder - b.displayOrder));
  })
  .catch(err => console.error("배너 불러오기 실패:", err));
  }, []);

  const resolveThumbnailUrl = (url) => {
    if (url && !url.startsWith('http')) {
      return `http://localhost:8081${url}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchStaffPicksWithProjects = async () => {
      try {
        const [projectsRes, picksRes] = await Promise.all([
          axios.get('http://localhost:8081/project/projectList'),
          axios.get('http://localhost:8081/project/staffPick')
        ]);

        const [projects, picks] = await Promise.all([
          projectsRes.json(),
          picksRes.json()
        ]);

        setAllProjects(projects);

        const newStaffPicks = picks.length > 0 ? picks.map(pick => {
          const matched = projects.find(p => Number(p.projectId) === Number(pick.projectId));
          return matched ? {
            projectId: matched.projectId,
            thumbnailUrl: matched.thumbnailUrl,
            title: matched.title,
            introduction: matched.introduction,
            slotIndex: pick.slotIndex
          } : null;
        }).filter(pick => pick !== null) : []; // 빈 배열이면, 빈 배열로 처리

        setStaffPickProjects(newStaffPicks);
      } catch (err) {
        console.error("스태프 선정 데이터 로딩 실패:", err);
      }
    };

    fetchStaffPicksWithProjects();
  }, []);

  return (
    <div className='main-container' style={{ minWidth: '1060px' }}>
      <div className='sw'>
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false, // 슬라이드를 클릭해도 자동 재생이 멈추지 않도록
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          loop={true} // 자동으로 첫 번째로 돌아가도록 설정
          speed={1000} // 넘어가는 속도를 1000ms 설정
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
                    style={{
                      width: '100%',
                      objectFit: 'cover',
                    }}
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

      <div className='maincon'>
        <div className='bt'>
          <h1 className='h1'>스태프 선정 작품</h1>
          <p className='p'>창의적이고 완성도가 높은 작품을 스태프가 직접 뽑아 소개해요.</p>

          <Swiper
            slidesPerView={4}
            slidesPerGroup={1}
            spaceBetween={30}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false, // 슬라이드를 클릭해도 자동 재생이 멈추지 않도록
            }}
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
                  />
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
      )}
        <div className="bt1">
          <h1>인기 작품</h1>
          <p>티코미들에게 이 작품들이 최근 주목 받고 있어요!</p>
          <Swiper
            slidesPerView={4}
            slidesPerGroup={1}
            spaceBetween={30}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false, // 슬라이드를 클릭해도 자동 재생이 멈추지 않도록
            }}
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
                  />
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
      <div>
        {userRole === 'EMPLOYEE' ? (
          <ErpLogo visible={true} />
        ) : (
          <ChatbotWindow />
        )}
        </div>
    </div>
  );
}
export default Main;