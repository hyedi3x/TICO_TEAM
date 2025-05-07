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
import "swiper/css/effect-coverflow";  
import { Autoplay, Pagination, Navigation, EffectCoverflow } from "swiper/modules";

// 챗 컴포넌트
import WepChat from "../pages/wep_chat/WepChat";
import ChatbotWindow from "../pages/chatbot/ChatbotWindow";
import ErpLogo from "../pages/erp/ErpLogo";
import ProjectCard from "./ProjectCard";
import axiosInstance from "../pages/login/social/utils/axiosInstance";

import animationData from "../assets/wired-lineal-259-share-arrow-hover-pointing.json"; // 4번 공유 아이콘
import animationPuzzle from "../assets/wired-lineal-186-puzzle-hover-detach.json";// 1번 퍼즐 아이콘
import animationCoope from "../assets/wired-lineal-981-consultation-hover-conversation.json";// 3번 협업 아이콘
import animationAi from "../assets/wired-lineal-2563-logo-wechat-hover-pinch.json";// 2번 협업 아이콘

import cloudAnimation from "../assets/Animation - 1746436050964.json"; // 배경 구름 애니메이션


import Lottie from "lottie-react";

function Main() {
  const [userRole, setUserRole] = useState(null);
  const [staffPickProjects, setStaffPickProjects] = useState([]);
  const [popularProjects, setPopularProjects] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // ⭐ 로딩 상태 추가
  const navigate = useNavigate();
  const [isChatVisible, setIsChatVisible] = useState(false); // 웹챗 표시 여부
  
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

  const [subtitles, setSubtitles] = useState([]); 
  const [hashtags, setHashtags] = useState([]);   

  // 모든 데이터 한 번에 불러오기 (병렬)
  // 모든 데이터 한 번에 불러오기 (병렬)
   // 모든 데이터 한 번에 불러오기 (병렬)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projectsRes, picksRes, popRes, bannerRes] = await Promise.all([ 
          // Promise.all로 모든 요청 기다림, 요청결과를 배열로 담고 모든 요청을 기다린다.
          // 배열 구조분해 할당을 사용해 순서대로 요청 결과가 담긴다.
          axiosInstance.get('/api/project/projects'),
          axiosInstance.get('/api/project/staffPick'),
          axiosInstance.get('/api/project/popularProjects'),
          axiosInstance.get('/api/banner/list')
        ]);
        // 모든 프로젝트
        const allProjects = projectsRes.data;
        console.log('모든 프로젝트:', allProjects);
        // 배너
        const subtitleArr = [];
        const hashtagArr = [];

        bannerRes.data.forEach(banner => {
          const bannerProjectId = parseInt(banner.bannerLink.split('/').pop()); // projectId 추출
          const matchedProject = allProjects.find(project => project.projectId === bannerProjectId);

          if (matchedProject) {
            // 소개글: 30자 초과 시 자르고 ... 붙이기
            const intro = matchedProject.introduction || "";
            const trimmedIntro = intro.length > 30 ? intro.slice(0, 30) + "..." : intro;
            subtitleArr.push(trimmedIntro);

            // 태그: 최대 4개만 표시, 초과 시 ' 외' 붙이기
            const tags = matchedProject.tags
              ? matchedProject.tags.split(',').map(tag => `#${tag.trim()}`)
              : [];
            const displayedTags = tags.slice(0, 4).join(' ');
            const extraText = tags.length > 4 ? ' 외' : '';
            hashtagArr.push(displayedTags + extraText);
          }
        });

        setSubtitles(subtitleArr);
        setHashtags(hashtagArr);

        // 스선
        const staffPicks = picksRes.data.map(pick => {
          const matched = allProjects.find(p => Number(p.projectId) === Number(pick.projectId));
          return matched ? {
            projectId: matched.projectId,
            thumbnailUrl: matched.thumbnailUrl,
            title: matched.title,
            introduction: matched.introduction,
            slotIndex: pick.slotIndex,
            likeCount : matched.likeCount,           
            bookmarkCount : matched.bookmarkCount,   
            viewCount : matched.viewCount,
            nickname : matched.nickname,          

          } : null;
        }).filter(Boolean); //filter(Boolean)은 true가 되는 값만 남긴다 (null, undefinded도 걸러줌)
        setStaffPickProjects(staffPicks);
        // 인작
        const popularWithNicknames = popRes.data.map(pop => {
          const matched = allProjects.find(p => Number(p.projectId) === Number(pop.projectId));
          return matched ? {
            ...pop,
            nickname: matched.nickname
          } : pop; // fallback: nickname 없으면 원본 그대로
        });
        setPopularProjects(popularWithNicknames.slice(0, 10));
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

  // 웹챗 반응형처리
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1800);
    // 브라우저 창의 크기가 변경될 때 발생하는 이벤트
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // 아이콘 클릭 시 웹챗 토글
  const toggleChat = () => {
    setIsChatVisible(prev => !prev);
  };

  if (!isLoaded) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩중...</div>;
  }

  return (
    <div className='main-wrapper'>
      {/* ── 유저간 채팅 ── */}
      
      {userRole !== "EMPLOYEE" && !isMobile && (
        <div className="chat-side-panel visible">
          <WepChat />
        </div>
      )}

      {userRole !== "EMPLOYEE" && isMobile && (
        <>
          {isChatVisible && (
            <div className="chat-side-panel visible">
              <WepChat />
            </div>
          )}
          <div className="chat-icon" onClick={toggleChat}>
            <span>💬</span>
          </div>
        </>
      )}

      {/* ── 백그라운드 cloud 영역 ── */}
      <div className="cloud-background">
        {[...Array(30)].map((_, i) => {
          const top = Math.random() * 90; // 화면 높이의 0~90%
          const left = Math.random() * -150 - 50; // -200% ~ -50%: 처음에 화면 밖에 있음
          const duration = 80 + Math.random() * 40; // 80~120초 속도로 천천히 이동
          const delay    = Math.random() * duration;   // 0~duration 만큼 진행된 상태로 (음수로)

          return (
            <div
              key={i}
              className="cloud-item"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                animationDelay: `-${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <Lottie animationData={cloudAnimation} loop autoplay />
            </div>
          );
        })}
      </div>


      <div className='main-container' style={{ minWidth: '1060px' }}>
        {/* ── 스와이퍼 영역 ── */}
        <div className="banner-wrapper">
          <Swiper
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={true}
            pagination={{
              type: "fraction",
              renderFraction: (currClass, totalClass) =>
                `<span class="${currClass}"></span> / <span class="${totalClass}"></span>`
            }}
            speed={800}
            modules={[Autoplay, Pagination, Navigation]}
            className="bannerSwiper"
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={index} onClick={() => navigate(banner.bannerLink)} className="banner-slide">
                <img
                  src={resolveThumbnailUrl(banner.bannerImage)}
                  alt={banner.bannerTitle}
                  className="banner-slide-img"
                />
                <div className="banner-text">
                  
                  <h2 className="banner-title">{banner.bannerTitle}</h2>
                  <div className="swiper-banner-subtitle">
                        {subtitles[index] || ""} {/* subtitles 배열에서 해당 인덱스의 부제목을 추출 */}
                      </div>
                      <div className="swiper-banner-hashtags">
                        {hashtags[index] || ""} {/* hashtags 배열에서 해당 인덱스의 해시태그를 추출 */}
                      </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* 감각적인 히어로(메인) 영역 - 스와이퍼 아래로 이동 */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>상상, 창작, 그리고 성장의 시작</h1>
            <p>블록코딩으로 누구나 쉽게 창작하고, 함께 성장하는 <span className="hero-brand">TICO</span>에서 새로운 미래를 만들어보세요.</p>
            <button className="hero-btn"
                onClick={() => navigate("/tutorial")}
              >
              <span className="hero-btn-icon">🚀</span> 시작하기
            </button>
          </div>
          <img src={process.env.PUBLIC_URL + '/coding_animated.gif'} alt="히어로 일러스트" className="hero-illust" />
        </section>


        {/* ── 스태프 선정 작품 ── */}
        <div className='bt'>
          <div className="section-header-box">
            <h1>🎨스태프 선정 작품</h1>
             <p className='p'>창의적이고 완성도가 높은 작품을 스태프가 직접 뽑아 소개해요.</p>
          </div>
          <Swiper
            className="coverflowSwiper mt-3" 
            // 1) coverflow 모드 활성화
             effect="coverflow"
            // 2) 사용 모듈에 EffectCoverflow 넣기
             modules={[Autoplay, Navigation, EffectCoverflow]}
             // 3) coverflow 동작 세부 옵션
             coverflowEffect={{
               rotate:    20,    // 회전 각도
               stretch:   0,     // 사이 간격
               depth:     200,   // 입체감 깊이
               modifier:  1,     // 전체 크기 배율
               slideShadows: false // 그림자
             }}
             slidesPerView="auto"
             centeredSlides={true}
             loop={true}
             navigation  
             autoplay={{ delay: 2500 , disableOnInteraction: false}} 
            slidesPerGroup={1}
            spaceBetween={30}
          >
            {staffPickProjects.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center w-100" style={{ height: "430px" }}>
                <h2>스태프 선정 작품이 없습니다. 등록해주세요.</h2>
              </div>
            ) : (
              staffPickProjects.map((project, index) => (
                <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="project-card">
                    <ProjectCard
                      project={project}
                      onClick={() => navigate(`/share/detail/${project.projectId}`)}
                      isStaff={staffPickIds.includes(Number(project.projectId))}
                      isPopular={popularIds.includes(Number(project.projectId))}
                    />
                  </div>  
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>

        {/* ── 인기 작품 ── */}
        <div className="bt1">
          <div className="section-header-box">
            <h1>⭐인기 작품</h1>
            <p>티코미들에게 이 작품들이 최근 주목 받고 있어요!</p>
          </div>

          <Swiper
            className="coverflowSwiper mt-3" 
            // 1) coverflow 모드 활성화
             effect="coverflow"
            // 2) 사용 모듈에 EffectCoverflow 넣기
             modules={[Autoplay, Navigation, EffectCoverflow]}
             // 3) coverflow 동작 세부 옵션
             coverflowEffect={{
               rotate:    20,    // 회전 각도
               stretch:   0,     // 사이 간격
               depth:     200,   // 입체감 깊이
               modifier:  1,     // 전체 크기 배율
               slideShadows: false // 그림자
             }}
             slidesPerView="auto"
             centeredSlides={true}
             loop={true}
             navigation  
             autoplay={{ delay: 2500 , disableOnInteraction: false}} 
            slidesPerGroup={1}
            spaceBetween={30}
          >
            {popularProjects.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center w-100" style={{ height: "430px" }}>
                <h2>인기 작품이 없습니다. 등록해주세요.</h2>
              </div>
            ) : (
              popularProjects.map((project, index) => (
                <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="project-card">
                    <ProjectCard
                      project={project}
                      onClick={() => navigate(`/share/detail/${project.projectId}`)}
                      isStaff={staffPickIds.includes(Number(project.projectId))}
                      isPopular={popularIds.includes(Number(project.projectId))}
                    />
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </div>
        
           {/* 기능 소개 카드 섹션 */}
      <section className="feature-section">
          <div className="feature-title">
            <h2>🕹️블록코딩의 모든 과정을 쉽고 재미있게!</h2>
            <p>누구나 쉽게 시작하고, AI와 함께 배우며, 친구와 협업하고, 완성작을 공유하세요.</p>
          </div>
          <div className="feature-card-list">
            <div className="feature-card feature-yellow">
              <div className="feature-Puzzle-icon">
                <Lottie
                  animationData={animationPuzzle}
                  loop={true}
                  style={{ width: 60, height: 60 }}
                />
              </div>
              <div className="feature-card-title">🧩블록코딩 시작하기</div>
              <div className="feature-card-desc">드래그 앤 드롭으로 누구나 쉽게 첫 코딩을 경험할 수 있어요.</div>
            </div>
            <div className="feature-card feature-blue">
              <div className="feature-Puzzle-icon">
                <Lottie
                  animationData={animationAi}
                  loop={true}
                  style={{ width: 60, height: 60 }}
                />
              </div>
              <div className="feature-card-title">🤖AI와 대화하며 배우기</div>
              <div className="feature-card-desc">AI 챗봇과 실시간으로 소통하며 코딩 개념을 쉽게 익혀요.</div>
              {/* <img src={process.env.PUBLIC_URL + '/img/feature2.png'} alt="AI와 대화" className="feature-card-img" /> */}
            </div>
            <div className="feature-card feature-green">
              <div className="feature-card-icon">
                  <Lottie
                    animationData={animationCoope}
                    loop={true}
                    style={{ width: 60, height: 60 }}
                  />
                </div>
              <div className="feature-card-title">👫친구와 협업 프로젝트</div>
              <div className="feature-card-desc">친구들과 함께 프로젝트를 만들고, 아이디어를 나눌 수 있어요.</div>
            </div>
            <div className="feature-card feature-pink">
              <div className="feature-card-icon">
                <Lottie
                  animationData={animationData}
                  loop={true}
                  style={{ width: 60, height: 60 }}
                />
              </div>
              <div className="feature-card-title">🌟완성작 공유하기</div>
              <div className="feature-card-desc">내가 만든 작품을 모두에게 자랑하고, 다양한 피드백을 받아보세요!</div>
            </div>
          </div>
        </section>


        {/* ── ERP 로고 or 챗봇 ── */}
        <div>
          {userRole === 'EMPLOYEE' ? (
            <ErpLogo visible={true} />
          ) : (
            <ChatbotWindow />
          )}
        </div>

        {/* ── 캠페인 안내 카드 섹션 ── */}
        <section className="campaign-section">
            <div className="campaign-banner">
              <img src={process.env.PUBLIC_URL + "/dream.png"} alt="tico" />
            </div>
            <div className="campaign-list">
              {[
                {
                  title: "AI 융합 블록코딩 플랫폼 <TICO>",
                  description: "초등학생도 쉽게 배우는 블록 코딩! AI와 함께 창의력 쑥쑥!",
                },
                {
                  title: "실시간 피드백과 챗봇 학습 지원",
                  description: "AI 챗봇이 실시간으로 도와줘요! 언제든 질문하고 바로 학습!",
                },
                {
                  title: "나만의 게임 만들기 & 실습형 학습",
                  description: "블록만 끌어다 놓으면 나만의 게임 완성! 직접 만들어 보며 실력 향상!",
                },
                {
                  title: "코딩 결과를 즉시 확인",
                  description: "블록을 조립하면 바로 실행 결과 확인! 반복하며 실력 UP!",
                },
              ].map((item, index) => (
                <div className="campaign-item-box" key={index}>
                  <div className="campaign-title-box">
                    <div className="campaign-title-text">
                      <div className="campaign-label">TICO</div>
                      <div className="campaign-project-title">{item.title}</div>
                    </div>
                  </div>
                  <div className="campaign-desc-text">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
      </div>  
    </div>    
  );
}

export default Main;



