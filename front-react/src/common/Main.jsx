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
import { Card, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import img1 from '../imgs/짱구1.jpg';
import ChatbotWindow from '../pages/chatbot/ChatbotWindow';
import ErpLogo from '../pages/erp/ErpLogo';
import ProjectCard from './ProjectCard';

function Main() {
  const [userRole, setUserRole] = useState(null);
  const [staffPicks, setStaffPicks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [staffPickProjects, setStaffPickProjects] = useState([
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
  ]);
  const getDefaultStaffPickProjects = () => [
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
    { projectId: null, thumbnailUrl: '', title: '등록해주세요', introduction: '' },
  ];
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

  useEffect(() => {
    fetch('http://localhost:8081/project/popularProjects')
      .then(res => res.json())
      .then(data => {
        console.log('🔥 인기 작품 목록:', data);
        setPopularProjects(data);
      })
      .catch(err => console.error("인기 작품 불러오기 실패:", err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8081/banner/list')
      .then(res => res.json())
      .then(data => setBanners(data.sort((a, b) => a.displayOrder - b.displayOrder)))
      .catch(err => console.error("배너 불러오기 실패:", err));
  }, []);

  const resolveThumbnailUrl = (url) => {
    if (url && !url.startsWith('http')) {
      return `http://localhost:8081${url}`;
    }
    return url || img1;
  };

  useEffect(() => {
    const fetchStaffPicksWithProjects = async () => {
      try {
        const [projectsRes, picksRes] = await Promise.all([
          fetch('http://localhost:8081/project/projectList'),
          fetch('http://localhost:8081/project/staffPick')
        ]);

        const [projects, picks] = await Promise.all([
          projectsRes.json(),
          picksRes.json()
        ]);

        setAllProjects(projects);

        const newStaffPicks = getDefaultStaffPickProjects();
        picks.forEach(pick => {
          const matched = projects.find(p => Number(p.projectId) === Number(pick.projectId));
          if (matched) {
            newStaffPicks[pick.slotIndex] = {
              projectId: matched.projectId,
              thumbnailUrl: matched.thumbnailUrl,
              title: matched.title,
              introduction: matched.introduction,
              slotIndex: pick.slotIndex
            };
          }
        });

        setStaffPickProjects(newStaffPicks);
      } catch (err) {
        console.error("스태프 선정 데이터 로딩 실패:", err);
      }
    };

    fetchStaffPicksWithProjects();
  }, []);

  return (
    <div className='main-container'>
      <div className='sw'>
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={index} onClick={() => navigate(banner.bannerLink)}>
              <img
                src={resolveThumbnailUrl(banner.bannerImage)}
                alt={banner.bannerTitle}
                style={{ width: '100%', height: '400px', objectFit: 'cover', cursor: 'pointer' }}
              />
            </SwiperSlide>
          ))}
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
            navigation
            loop={true}
            modules={[Navigation]}
            className="staffSwiper mt-3"
          >
            {staffPickProjects.map((project, index) => (
              <SwiperSlide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                <ProjectCard
                  project={project}
                  onClick={() => navigate(`/share/detail/${project.projectId}`)}
                  showStats={false}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="bt1">
          <h1>인기 작품</h1>
          <p>티코미들에게 이 작품들이 최근 주목 받고 있어요!</p>
          <Row xs={1} sm={2} md={3} lg={4} className="g-4 justify-content-center mt-3">
            {popularProjects.map((project, index) => (
              <Col key={index}>
                <ProjectCard
                  project={project}
                  onClick={() => navigate(`/share/detail/${project.projectId}`)}
                />
              </Col>
            ))}
          </Row>
        </div>
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
