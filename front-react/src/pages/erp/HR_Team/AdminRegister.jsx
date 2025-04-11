import React, { useState, useEffect } from 'react';
import { Panel, Grid, Row, Col, Input, DatePicker, SelectPicker, Button } from "rsuite";    // rsuite UI 라이브러리에서 제공하는 컴포넌트들
import { useNavigate } from 'react-router-dom'; 
import "./adminRegister.css"; 
import "./adminContainer.css";

function AdminRegister() {
  const navigate = useNavigate();// 페이지 이동을 위한 navigate 훅 사용

  // 폼 변수 선언
  const [form, setForm] = useState({
    empName: "",
    empPwd: "", 
    empBirth: null,
    empPhone: "", 
    empHome: "",
    empEmail: "", 
    depId: "",
    jobId: "", 
    hireDate: null,
    terminationDate: null, // 퇴사일
    salary: "",
  });

  // 부서와 직무 옵션을 가져오기 위한 상태들
  const [departments, setDepartments] = useState([]); // 부서 목록
  const [allJobs, setAllJobs] = useState([]);         // 전체 직무 목록
  const [filteredJobs, setFilteredJobs] = useState([]); // 필터된 직무 목록 (부서에 따라 직무 필터링)

  // 컴포넌트가 처음 렌더링될 때 부서 목록과 직무 목록을 스프링 부트에서 호출
  useEffect(() => {
    // 부서 정보를 스프링 부트 서버에서 호출
    fetch("http://localhost:8081/api/departments")
      .then((res) => res.json())
      .then((data) => {
        const departmentOptions = data.map((dep) => ({  // SelectPicker에서 쓸 수 있게 {label, value}  형태로 가공 
          label: dep.depName,
          value: dep.depId
        }));
        setDepartments(departmentOptions); // 부서 목록 설정
  
        // 부서 목록 길이가 0 이상일 때 (부서 목록을 선택 및 입력했는지 여부)
        if (departmentOptions.length > 0) {
          setForm((prev) => ({
            ...prev,
            depId: departmentOptions[0].value // 부서 목록이 로드되면 기본 값 설정
          }));
        }
      });
  
    // 직무 목록을 가져오는 요청
    fetch("http://localhost:8081/api/jobs")
      .then((res) => res.json())
      .then((data) => setAllJobs(data)); // 직무 천체 목록을 가져와 저장
  }, []);
  

  // 부서 선택 시 해당 부서에 속한 직무 목록 필터링
  const handleDepChange = (depId) => {
    console.log("선택된 부서 ID:", depId);  

    // setForm : form 상태 업데이트, depId 선택시, jobId 초기화 (부서를 다시 선택하면 기존 선택한 직무는 초기화)
    setForm((prev) => ({ ...prev, depId, jobId: "" }));

    const jobsForDep = allJobs
      .filter((job) => job.depId === depId)  // 부서 ID로 직무 필터링
      .map((job) => ({ label: job.jobName, value: job.jobId }));  // 직무 목록을 SelectPicker에 맞게 변환
    console.log("필터링된 직무:", jobsForDep);  // 직무 필터링된 결과 확인
    setFilteredJobs(jobsForDep);  // 필터링된 직무 목록 상태 업데이트
  };
  
  // 입력 값 변화 시 폼 상태 업데이트
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value })); // 필드별로 상태 값 업데이트
  };

  // 저장 버튼 클릭 시 
  const handleSubmit = async () => {
    try {
      // 월급을 숫자 타입으로 변환 후 연봉 계산
      const monthly = Number(form.salary || 0); // 월급
      const annual = monthly * 12; // 연봉
      const net = annual * 0.9; // 세후 연봉 계산(10% 세금 공제 가정)

      // payload : 리액트에서 스프링 부트에 보낼 변환된 데이터셋 
      const payload = {
        ...form,
        salary: monthly,
        annualSalary: annual,
        netAnnualSalary: net,
        // form.empBirth ? ... : null | 사용자가 값을 입력 o → form.empBirth.toISOString().split("T")[0] 실행 / 입력 x → null 반환
        // toISOString() : yyyy-mm-dd 형식으로 변환 ( 날짜를 ISO 포맷 문자열)
        // .split("T")[0] : T를 기준으로 자름 (시간 정보는 필요없기 때문에)
        empBirth: form.empBirth ? form.empBirth.toISOString().split("T")[0] : null,
        hireDate: form.hireDate ? form.hireDate.toISOString().split("T")[0] : null, 
        terminationDate: form.terminationDate ? form.terminationDate.toISOString().split("T")[0] : null,
      };

      console.log("전송될 payload:", payload); // 최종 제출될 데이터 로그로 확인(디버깅 용)

      // 스프링 부트 서버에 사원 데이터 전송
      const res = await fetch("http://localhost:8081/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),   // payload를 JSON 형태로 전송
      });

      if (res.ok) {
        alert("사원 등록 성공!");
        navigate("/erpMain"); // 등록 성공 시 erpMain 페이지로 이동
      } else {
        const errText = await res.text();
        alert("등록 실패: " + res.status + "\n" + errText); // 실패 시 에러 메시지
      }
    } catch (err) {
      console.error("등록 에러:", err);
      alert("에러 발생!"); // 에러 발생 시 알림
    }
  };

  // 직무 옵션을 부서에 따라 다르게 설정
  const jobOptions = form.depId
    ? filteredJobs  // 부서가 선택된 경우 필터링된 직무 목록
    : allJobs.map((job) => ({ label: job.jobName, value: job.jobId })); // 모든 직무 목록

  // 주소 검색을 위한 Daum 우편번호 서비스 호출
  const openDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setForm((prev) => ({ ...prev, empHome: data.address })); // 주소 입력
      },
    }).open();
  };

  // Daum 우편번호 스크립트 호출
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script); // 외부 스크립트 추가
  }, []);

  return (
    <div className="admin-form-container">
      {/* 기본정보 입력 패널 */}
      <Panel header="기본정보" className="panel-container">
        <Grid fluid>
          <Row className="form-row">
            <Col sm={6}>
              <SelectPicker
                placeholder="부서코드"
                data={departments}
                value={form.depId || ""} // depId가 없으면 빈 문자열로 처리
                onChange={handleDepChange}
                style={{ width: "100%" }}
                searchable={false}
              />
            </Col>
            <Col sm={6}>
              <SelectPicker
                placeholder="직책코드"
                data={jobOptions}
                value={form.jobId}
                onChange={(v) => handleChange("jobId", v)}
                style={{ width: "100%" }}
                searchable={false}
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="사원 비밀번호 (이름+월일)"
                type="password"
                value={form.empPwd}
                onChange={(v) => handleChange("empPwd", v)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="기본급 (월급)"
                type="number"
                value={form.salary}
                onChange={(v) => handleChange("salary", v)}
                style={{ width: "100%" }}
              />
            </Col>
          </Row>
        </Grid>
      </Panel>

      {/* 인적사항 입력 패널 */}
      <Panel header="인적사항" className="panel-container">
        <Grid fluid>
          <Row className="form-row">
            <Col sm={6}>
              <Input
                placeholder="이름"
                value={form.empName}
                onChange={(v) => handleChange("empName", v)}
              />
            </Col>
            <Col sm={6}>
              <DatePicker
                placeholder="생년월일"
                value={form.empBirth}
                onChange={(v) => handleChange("empBirth", v)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="전화번호"
                value={form.empPhone}
                onChange={(v) => handleChange("empPhone", v)}
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="이메일"
                value={form.empEmail}
                onChange={(v) => handleChange("empEmail", v)}
              />
            </Col>
            <Col sm={6}>
              <DatePicker
                placeholder="입사일"
                value={form.hireDate}
                onChange={(v) => handleChange("hireDate", v)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col sm={6}>
              <DatePicker
                placeholder="퇴사일"
                value={form.terminationDate}
                onChange={(v) => handleChange("terminationDate", v)}
                style={{ width: "100%" }}
              />
            </Col>
          </Row>
        </Grid>
      </Panel>

      {/* 주소 정보 입력 패널 */}
      <Panel header="주소 정보" className="panel-container">
        <Grid fluid>
          <Row className="form-row">
            <Col sm={16}>
              <Input
                placeholder="주소"
                value={form.empHome}
                onChange={(v) => handleChange("empHome", v)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col sm={6}>
              <button className="search-btn" onClick={openDaumPostcode}>
                주소 검색
              </button>
            </Col>
          </Row>
        </Grid>
      </Panel>

      {/* 저장 버튼 */}
      <div className="save-btn-wrap">
        <Button className="submit-btn" onClick={handleSubmit} type="submit">
          저장
        </Button>
      </div>
    </div>
  );
}

export default AdminRegister;
