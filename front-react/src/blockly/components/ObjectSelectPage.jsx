import { useState } from 'react';
import { Container, Sidebar, Sidenav, Nav, Content, Header, ButtonGroup, Button } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

// 카테고리 목록
const categories = [
  '엔트리봇', '우엔보', '사람', '동물', '식물', '탈것',
  '건물', '음식', '환경', '물건', '판타지', '인터페이스', '배경'
];

// 예시 오브젝트 데이터
const dummyObjects = [
  { id: 1, name: '(1)엔트리봇', category: '엔트리봇', image: '/images/object1.png' },
  { id: 2, name: 'OK 엔트리봇', category: '엔트리봇', image: '/images/object2.png' },
  { id: 3, name: 'NO 엔트리봇', category: '엔트리봇', image: '/images/object3.png' },
  // ... 추가 가능
];

function ObjectSelectPage() {
  const [selectedCategory, setSelectedCategory] = useState('엔트리봇');

  const filteredObjects = dummyObjects.filter(obj => obj.category === selectedCategory);

  return (
    <Container style={{ height: '100vh' }}>
      {/* 왼쪽 사이드바: 카테고리 메뉴 */}
      <Sidebar width={160} style={{ background: '#f7f7f7' }}>
        <Sidenav defaultOpenKeys={['1']} appearance="subtle">
          <Sidenav.Body>
            <Nav activeKey={selectedCategory} onSelect={setSelectedCategory}>
              {categories.map(cat => (
                <Nav.Item key={cat} eventKey={cat}>
                  {cat}
                </Nav.Item>
              ))}
            </Nav>
          </Sidenav.Body>
        </Sidenav>
      </Sidebar>

      {/* 오른쪽: 상단 메뉴 + 콘텐츠 */}
      <Container>
        {/* 상단 메뉴바 */}
        <Header className="p-4 bg-white shadow-sm border-b">
          <ButtonGroup>
            <Button appearance="primary">오브젝트 선택</Button>
            <Button appearance="default">파일 올리기</Button>
            <Button appearance="default">새로 그리기</Button>
            <Button appearance="default">글상자</Button>
          </ButtonGroup>
        </Header>

        {/* 메인 콘텐츠: 오브젝트 리스트 */}
        <Content className="p-4 overflow-auto">
          <div className="grid grid-cols-5 gap-4">
            {filteredObjects.map(obj => (
              <div key={obj.id} className="text-center">
                <img
                  src={obj.image}
                  alt={obj.name}
                  className="w-20 h-20 mx-auto object-contain"
                />
                <div className="mt-2 text-sm">{obj.name}</div>
              </div>
            ))}
          </div>
        </Content>
      </Container>
    </Container>
  );
}

export default ObjectSelectPage;