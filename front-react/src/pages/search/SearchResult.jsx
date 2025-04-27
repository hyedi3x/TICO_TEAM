import React, { useEffect, useState } from 'react';
import { List, Panel, Tag, Grid, Row, Col } from 'rsuite';
import { FaThumbsUp, FaEye, FaRegCommentDots } from 'react-icons/fa'; // FontAwesome 아이콘 사용 (설치 필요)
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../login/social/utils/axiosInstance';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResult() {
  const query = useQuery();
  const keyword = query.get('query') || '';
  const [projectResults, setProjectResults] = useState([]);
  const [pageResults, setPageResults] = useState([]);
  const [commentResults, setCommentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url; // 이미 전체 URL이면 그대로
    return `https://tico.kro.kr${url}`;    // 상대경로면 도메인 붙여줌
  };

  useEffect(() => {
    if (!keyword.trim()) {
      setProjectResults([]);
      setPageResults([]);
      setCommentResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosInstance
      .get(`/api/search`, { params: { query: keyword } })
      .then((res) => {
        setProjectResults(res.data.projects || []);
        setPageResults(res.data.pages || []);
        setCommentResults(res.data.comments || []);
        setLoading(false);
      })
      .catch(() => {
        setProjectResults([]);
        setPageResults([]);
        setCommentResults([]);
        setLoading(false);
      });
  }, [keyword]);

  return (
    <div style={{ padding: '2rem', minHeight: '60vh' }}>
        <h3>
            "{keyword}" 검색 결과 {loading ? '조회 중...' : `(${projectResults.length + pageResults.length + commentResults.length}건)`}
        </h3>

        {/* ===== 페이지/메뉴 섹션 ===== */}
        <div style={{ marginTop: 28, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 10 }}>페이지({pageResults.length})</div>
            <List bordered hover>
                {pageResults.length === 0 && (
                    <List.Item>
                        <div style={{ color: '#888', padding: '8px 0' }}>결과가 없습니다.</div>
                    </List.Item>
                )}
                {pageResults.map((page) => {
                    const userUuid = localStorage.getItem('user_uuid');
                    const isLoggedIn = !!userUuid;
                    const disabled = !isLoggedIn && page.requireLogin === 'Y';

                    return (
                        <List.Item
                            key={`page-${page.pageId}`}
                            style={{
                            opacity: disabled ? 0.5 : 1,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            marginBottom: 6,
                            }}
                            onClick={() => {
                            if (disabled) {
                                if (!isLoggedIn && page.requireLogin === 'Y') {
                                    alert('로그인이 필요한 메뉴입니다.');
                                }
                                return;
                            }
                                navigate(page.pagePath);
                            }}
                        >
                        <Panel shaded bordered bodyFill style={{ background: '#f7fafd', border: 'none', boxShadow: 'none', margin: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                {page.pageName}
                                    <Tag color="cyan" style={{ marginLeft: 8, fontSize: '0.85rem' }}>페이지 바로가기</Tag>
                            </div>
                            <div style={{ marginTop: 3 }}>
                                {page.requireLogin === 'Y' && (
                                    <Tag color="red" style={{ fontSize: '0.8rem', marginRight: 6 }}>로그인 필요 페이지</Tag>
                                )}
                            </div>
                        </Panel>
                    </List.Item>
                    );
                })}
            </List>
        </div>

        {/* ===== 작품(카드형 그리드) 섹션 ===== */}
        <div style={{ marginTop: 32 }}>
            <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 10 }}>작품({projectResults.length})</div>
            {projectResults.length === 0 ? (
                <div style={{ color: '#888', margin: '16px 0 24px 0' }}>결과가 없습니다.</div>
            ) : (
            <Grid fluid>
                <Row gutter={24}>
                    {projectResults.map(item => (
                        <Col 
                            key={item.projectId} 
                            xs={24} sm={12} md={8} lg={6} xl={4} 
                            style={{ marginBottom: 28 }}>
                        <Panel
                            shaded
                            bordered
                            bodyFill
                            style={{ padding: 0, borderRadius: 16, cursor: 'pointer', minHeight: 270 }}
                            onClick={() => navigate(`/share/detail/${item.projectId}`)}
                        >
                            {item.thumbnailUrl ? (
                                <div style={{ height: 140, background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                    src={resolveThumbnailUrl(item.thumbnailUrl)}
                                    alt="썸네일"
                                    style={{ maxHeight: 120, maxWidth: '90%', objectFit: 'contain' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ height: 140, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src="/default_thumbnail.png" alt="기본 썸네일" style={{ maxHeight: 80, opacity: 0.4 }} />
                                </div>
                            )}
                            <div style={{ padding: '18px 18px 10px 18px' }}>
                                <div style={{ fontWeight: 600, fontSize: '1.07rem', marginBottom: 2 }}>
                                    {item.title}
                                </div>
                                <div style={{ color: '#888', fontSize: '0.92rem', marginBottom: 10, whiteSpace: 'pre-line', minHeight: 28 }}>
                                    {item.introduction}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.98rem', marginTop: 5 }}>
                                    <span><FaThumbsUp style={{ color: '#ffd500' }} /> {item.likeCount ?? 0}</span>
                                    <span><FaEye style={{ color: '#8ecfff' }} /> {item.viewCount ?? 0}</span>
                                    <span><FaRegCommentDots style={{ color: '#888' }} /> {item.commentCount ?? 0}</span>
                                </div>
                            </div>
                        </Panel>
                        </Col>
                    ))}
                </Row>
            </Grid>
            )}
        </div>

        {/* ===== 작품 댓글 섹션 ===== */}
        <div style={{ marginTop: 32 }}>
            <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 10 }}>작품 댓글({commentResults.length})</div>
            {commentResults.length === 0 ? (
                <div style={{ color: '#888', margin: '16px 0 24px 0' }}>결과가 없습니다.</div>
            ) : (
                <List bordered hover>
                    {commentResults.map((c) => (
                        <List.Item key={c.commentId}>
                            <Panel 
                                shaded 
                                bordered 
                                bodyFill 
                                style={{ 
                                    background: '#f7fafd', 
                                    border: 'none', 
                                    boxShadow: 'none', 
                                    cursor: c.projectId ? 'pointer' : 'not-allowed',
                                    margin: 0 }}
                                onClick={() => navigate(`/share/detail/${c.projectId}`)}
                            >
                                <div style={{ fontSize: '0.97rem' }}>
                                    <b>{c.nickname}</b> ({c.createdAt && c.createdAt.slice(0,10)}) {c.commentText}
                                </div>
                                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>
                                    작품: <span style={{ fontWeight: 500 }}>{c.title}</span>
                                </div>
                            </Panel>
                        </List.Item>
                    ))}
                </List>
            )}
        </div>
    </div>
  );
}

export default SearchResult;