import React, { useState, useRef, useEffect } from "react";
import { IoPersonCircle } from "react-icons/io5";   // 프로필 아이콘(기본 이미지 대체용)
import axiosInstance from "../login/social/utils/axiosInstance";

function ErpDTO() {
  const [empInfo, setEmpInfo] = useState(null);   // 로그인된 사원 정보 상태(초기값 null)
  const fileInputRef = useRef(null);              // 프로필 이미지 업로드용 input 요소를 참조하기 위한 useRef

  //컴포넌트 마운트 시(처음 렌더링 시) 사원 정보를 서버에서 불러오는 useEffect
  useEffect(() => {
    const empId = localStorage.getItem("user_uuid");  // 로그인된 사용자 UUID를 localStorage에서 읽어서 정보 요청
  
    if (empId) {
      axiosInstance
        .get(`/api/notices/employee/${empId}`)
        .then((response) => {
          console.log("응답 데이터 :", response.data);  // 서버 응답 로그 출력 
          setEmpInfo(response.data);   // 사원 정보 상태에 저장
        })
        .catch((err) => {
          console.error("관리자 정보 로딩 실패", err);
        });
    }
  }, []);
  
  // 프로필 이미지 선택 시 미리보기 설정
  const imgChange = (event) => {
    const file = event.target.files[0];   // 선택된 파일 1개

    if (file) {
      const reader = new FileReader();    // 파일을 읽기 위한 객체 생성
      reader.onloadend = () => {
        // 파일을 다 읽은 뒤 실행되는 콜백
        setEmpInfo((prev) => 
          ({ ...prev, 
            profileImage: reader.result,  // base64 문자열을 profileImage 필드에 저장 => 서버로는 FormData로 보내는 방식으로 구현해야함.
          }));
      };
      reader.readAsDataURL(file); // 파일을 base64로 읽기 시작
    }
  };

  // empInfo가 아직 로드되지 않았을 경우 로딩 처리
  if (!empInfo) return <div>⏳ 관리자 정보를 불러오는 중...</div>;

  // 사원 정보가 준비된 경우 JSX 반환
  return (
  <div className="user-info">
        <h3>회원 정보</h3>
        <div className="profile-image-container">
          {/* 프로필 이미지가 있는 경우 */}
          {empInfo.profileImage ? (
            <img 
              src={empInfo.profileImage} 
              alt="프로필 사진" 
              className="profile-image" />
          ) : (
            // 없는 경우 기본 아이콘을 클릭하면 파일 업로드 input 열기
            <div 
              className="icon-placeholder" 
              onClick={() => fileInputRef.current.click()}>
              <IoPersonCircle size="10em" />
            </div>
          )}
          {/* 실제 이미지 업로드 input 요소 (숨김 처리) */}
          <input
            type="file"
            accept="image/*"
            onChange={imgChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </div>
        <div className="userInfoText">
          ID : {empInfo.empId}<br />
          이름 : {empInfo.empName}<br />
          부서 ID : {empInfo.depId}<br />
          직무 ID : {empInfo.jobId}<br />
          이메일 : {empInfo.empEmail}<br />
          전화번호 : {empInfo.empPhone}<br />
          주소 : {empInfo.empHome}<br />
          생년월일 : {empInfo.empBirth}
        </div>
      </div>
  )
}

export default ErpDTO;