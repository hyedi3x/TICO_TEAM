import React from 'react';

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

//이미지 파일
import img1 from '../imgs/짱구1.jpg';

// 스타일
import './Main.css';

function Main() {
  return (
    <div className='main-container'>
      {/* 스와이퍼 영역 */}
      <div className='sw'>
        {/* Swiper 컴포넌트 : 이미지 슬라이드 쇼 구현 */}
        <Swiper
        spaceBetween={30}       // 슬라이드 간 간격
        centeredSlides={true}   // 활성 슬라이드를 가운데로 배치
        autoplay={{             // 자동 재생 설정
          delay: 2500,          // 슬라이드 간 지연 시간(2.5초)
          disableOnInteraction: false,    // 사용자 상호작용 후 자동 재생 중단 여부
        }}
        pagination={{           // 페이지네이션 설정
          clickable: true,      // 페이지네이션 클릭 가능 여부
        }}
        navigation={true}       // 네비게이션 화살표 표시
        modules={[Autoplay, Pagination, Navigation]}  // 사용한 모듈 등록
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
          {/* Card 컴포넌트 */}
          <h1 className='h1'>스태프 선정 작품</h1>
          <p className='p'>창의적이고 완성도가 높은 작품을 스태프가 직접 뽑아 소개해요.</p>
          {/* 카드 목록 */}
          <Row className='oneCard'>
            {/* 각 카드 열 */}
            <Col>
            {/* 카드 컴포넌트 */}
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1'/>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                    <Card.Text>
                      Some quick example text to build on the card title and make up the
                      bulk of the card's content.
                  </Card.Text>
                  {/* <Button variant="primary">Go somewhere</Button> */}
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1'/>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                    <Card.Text>
                      Some quick example text to build on the card title and make up the
                      bulk of the card's content.
                  </Card.Text>
                  {/* <Button variant="primary">Go somewhere</Button> */}
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1'/>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                    <Card.Text>
                      Some quick example text to build on the card title and make up the
                      bulk of the card's content.
                  </Card.Text>
                  {/* <Button variant="primary">Go somewhere</Button> */}
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card style={{ width: '15rem' }}>
                <Card.Img variant="top" src={img1} alt='짱구1'/>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                    <Card.Text>
                      Some quick example text to build on the card title and make up the
                      bulk of the card's content.
                  </Card.Text>
                  {/* <Button variant="primary">Go somewhere</Button> */}
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
            {/* 배열을 이용한 카드 생성 */}
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
    </div>
  );
}

export default Main;
