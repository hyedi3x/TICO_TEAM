import axiosInstance from "../../pages/login/social/utils/axiosInstance";

// 전체 프로젝트 불러오기
export const fetchAllProjects = async () => {
  try {
    const userid = localStorage.getItem("user_uuid");
    const res = await axiosInstance.get(`/api/project/userProjects/${userid}`);
    return res.data;
  } catch (err) {
    console.error('작품 목록 불러오기 실패:', err);
    throw err;
  }
};

// setState를 외부에서 받아서 사용하는 형태
export const handleLoadClick = async (setProjectList, setShowProjectModal) => {
  if(window.running){
    return;
  }
  try {
    const data = await fetchAllProjects();
    setProjectList(data);
    setShowProjectModal(true);
  } catch (err) {
    alert('작품 목록을 불러오지 못했습니다.');
  }
};
