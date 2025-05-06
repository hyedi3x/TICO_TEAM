// src/pages/erp/ProjectManage.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../pages/login/social/utils/axiosInstance";
import { Grid, Row, Col, Panel, Button, Placeholder } from "rsuite";
import "./ProjectManage.css";
import "rsuite/dist/rsuite.min.css";

function ProjectManage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/api/report/reported-projects")
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ 신고된 작품 불러오기 실패", err);
        setLoading(false);
      });
  }, []);

  const resolveThumbnailUrl = (url) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8081${url}`;
  };

  const handleDelete = (projectId) => {
    if (!window.confirm("정말 이 작품을 삭제하시겠습니까?")) return;

    axiosInstance.delete(`/api/project/deleteProject/${projectId}`)
      .then(() => {
        setProjects(prev => prev.filter(p => p.projectId !== projectId));
        alert("✅ 삭제 완료");
      })
      .catch(err => {
        console.error("❌ 삭제 실패", err);
        alert("삭제에 실패했습니다.");
      });
  };

  return (
    <Grid style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
      <h2 style={{ fontSize: "26px", color: "#ff4d4f", marginBottom: "30px" }}>
        🚨 신고된 작품 관리
      </h2>
      {loading ? (
        <Placeholder.Paragraph rows={5} active />
      ) : projects.length === 0 ? (
        <p>신고된 작품이 없습니다.</p>
      ) : (
        <Row gutter={16}>
          {projects.map((p) => (
            <Col key={p.projectId} xs={24} sm={12} md={8}>
              <Panel shaded bordered bodyFill style={{ marginBottom: 20 }}>
                <img
                  src={resolveThumbnailUrl(p.thumbnailUrl)}
                  alt="썸네일"
                  className="project-thumbnail"
                />
                <Panel header={<h4 className="project-title">{p.title}</h4>}>
                    <p className="project-author">{p.nickname}</p>
                        <Button
                            style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none' }}
                            className="project-delete-btn"
                            onClick={() => handleDelete(p.projectId)}
                        >
                            삭제
                        </Button>
                </Panel>
              </Panel>
            </Col>
          ))}
        </Row>
      )}
    </Grid>
  );
}

export default ProjectManage;