import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup, Divider, Input, Message } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import axiosInstance from '../../pages/login/social/utils/axiosInstance';
import StudySelector from './StudySelector';

function StudyCreate() {
  const navigate = useNavigate();
  const user_uuid = localStorage.getItem('user_uuid');

  const [form, setForm] = useState({
    title: '',
    category: '기타',
    introduction: '',
    goal: '',
    difficulty: '쉬움',
    duration: '15분'
  });

  const [projectId, setProjectId] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  };

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
      
    if (!form.title.trim()) {
        alert('제목을 입력해 주세요');
        return;
    }
    
    if (!form.introduction.trim()) {
        alert('소개를 입력해 주세요');
        return;
    }
    
    if (!form.goal.trim()) {
        alert('목표를 입력해 주세요');
        return;
    }
    
    if (!projectId) {
        Message.error('완성 작품을 선택해 주세요');
        return;
    }

    try {
      await axiosInstance.post('/api/study/create', {
        ...form,
        userUuid: user_uuid,
        projectId: projectId,
        isprivate: 'Y',
        isagree: 'N'
      });
      alert('스터디 등록 완료!');
      navigate('/MypageMain');
    } catch (err) {
      console.error(err);
      alert('등록 실패');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 30 }}>
      <h3>스터디 만들기</h3>

      {/* 제목 */}
      <Input
        placeholder="스터디 제목 입력(필수)"
        value={form.title}
        onChange={value => handleChange('title', value)}
      />

      {/* 카테고리 */}
      <Divider>카테고리 선택</Divider>
      <ButtonGroup>
        {['기타', '게임', '예술', '도구'].map(cat => (
          <Button
            key={cat}
            appearance={form.category === cat ? 'primary' : 'ghost'}
            onClick={() => handleChange('category', cat)}
          >
            {cat}
          </Button>
        ))}
      </ButtonGroup>

      {/* 소개 */}
      <Divider>스터디 소개</Divider>
      <Input
        as="textarea"
        rows={4}
        placeholder="스터디 소개 입력(필수)"
        value={form.introduction}
        onChange={value => handleChange('introduction', value)}
      />

      {/* 목표 */}
      <Divider>스터디 목표</Divider>
      <Input
        as="textarea"
        rows={4}
        placeholder="스터디 목표 입력(필수)"
        value={form.goal}
        onChange={value => handleChange('goal', value)}
      />

      {/* 난이도 */}
      <Divider>난이도</Divider>
      <ButtonGroup>
        {['쉬움', '중간', '어려움'].map(dif => (
          <Button
            key={dif}
            appearance={form.difficulty === dif ? 'primary' : 'ghost'}
            onClick={() => handleChange('difficulty', dif)}
          >
            {dif}
          </Button>
        ))}
      </ButtonGroup>

      {/* 소요 시간 */}
      <Divider>예상 소요 시간</Divider>
      <ButtonGroup>
        {['15분', '30분', '1시간 이상'].map(dur => (
          <Button
            key={dur}
            appearance={form.duration === dur ? 'primary' : 'ghost'}
            onClick={() => handleChange('duration', dur)}
          >
            {dur}
          </Button>
        ))}
      </ButtonGroup>

      {/* 작품 선택 */}
      <Divider>완성 작품 선택</Divider>
      <Button appearance="ghost" onClick={() => setShowSelector(true)}>작품 선택</Button>
      {!projectId && <p style={{ color: 'red' }}>※ 작품을 선택해 주세요.</p>}

      <StudySelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={(project) => {
            setSelectedProject(project);
            setProjectId(project.projectId);
        }}
      />
        {selectedProject && (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
                <p><strong>선택된 작품:</strong> {selectedProject.title}</p>
                <img
                src={resolveThumbnailUrl(selectedProject.thumbnailUrl)}
                alt="선택된 썸네일"
                style={{ width: '200px', borderRadius: 8 }}
                />
            </div>
        )}

        <Divider />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button appearance="primary" onClick={handleSubmit}>등록</Button>
            <Button appearance="ghost" onClick={() => navigate(-1)}>취소</Button>
        </div>
    </div>
  );
}

export default StudyCreate;