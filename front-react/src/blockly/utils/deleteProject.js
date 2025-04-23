import axios from "axios";

export const handleDeleteProject = async (projectId) => {
    if(!projectId){
        alert("삭제할 프로젝트가 존재하지 않습니다");
        return;
    }

    const confirmed = window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?");
    if(!confirmed) return;

    try{
        let res;
        res = await axios.delete(`http://localhost:8081/project/deleteProject/${projectId}`);
        alert(`${res.data}번째 작품이 성공적으로 삭제되었습니다.`);
        window.location.reload(); // 새로고침
    }catch(err){
        console.error("삭제 실패", err);
        alert("삭제 중 문제가 발생했습니다.");
    }
}