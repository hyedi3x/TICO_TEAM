import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 스타일
import './Main.css';
import '../pages/chatbot/chatbot.css';

// Swiper React 컴포넌트
import { Swiper, SwiperSlide } from 'swiper/react';

// Swiper 스타일
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Swiper 모듈(자동 재생, 페이지네이션, 네비게이션)
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Bootstrap 컴포넌트(카드, 열, 행)
import { Card, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// 이미지 파일
import img1 from '../imgs/짱구1.jpg';

// chatbot 객체 임포트
import Chatbot from '../pages/chatbot/Chatbot';

function Main() {
  const navigate = useNavigate();

  return (
    <div className='main-container'>
      {/* 스와이퍼 영역 */}
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
          <SwiperSlide>Slide 1</SwiperSlide>
          <SwiperSlide>Slide 2</SwiperSlide>
          <SwiperSlide>Slide 3</SwiperSlide>
          <SwiperSlide>Slide 4</SwiperSlide>
          <SwiperSlide>Slide 5</SwiperSlide>
          <SwiperSlide>Slide 6</SwiperSlide>
          <SwiperSlide>Slide 7</SwiperSlide>
          <SwiperSlide>Slide 8</SwiperSlide>
          <SwiperSlide>Slide 9</SwiperSlide>
        </Swiper>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className='maincon'>
        {/* 스태프 선정 작품 섹션 */}
        <div className='bt'>
          <h1 className='h1'>스태프 선정 작품</h1>
          <p className='p'>창 W의적이고 완성도가 높은 작품을 스태프가 직접 뽑아 소개해요.</p>
          <Row className='oneCard'>
            <Col>
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1' />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make up the
                    bulk of the card's content.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1' />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make up the
                    bulk of the card's content.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1' />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make up the
                    bulk of the card's content.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1' />
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make up the
                    bulk of the card's content.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* 인기 작품 섹션 */}
        <div className="bt1">
          <h1>인기 작품</h1>
          <p>티코미들에게 이 작품들이 최근 주목 받고 있어요!</p>
          <Row xs={1} md={2} className="g-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Col key={idx}>
                <Card>
                  <Card.Img variant="top" src={img1} alt='짱구1' />
                  <Card.Body>
                    <Card.Title>Card title</Card.Title>
                    <Card.Text>
                      This is a longer card with supporting text below as a natural
                      lead-in to additional content. This content is a little bit
                      longer.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Chatbot 임포트 */}
      <Chatbot />
    </div>
  );
}

export default Main;