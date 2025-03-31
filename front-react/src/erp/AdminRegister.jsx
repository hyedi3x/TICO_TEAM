// AdminRegister.jsx
import React, { useState, useEffect } from "react";
import {Panel, Grid, Row, Col, Input, DatePicker, SelectPicker, Button,} from "rsuite";
import { useNavigate } from "react-router-dom";
import "./adminRegister.css";
import "./admin.css";

function AdminRegister() {
  const navigate = useNavigate(); // 페이지 이동용 훅

  // 기본 상태 정의
  const [form, setForm] = useState({
    empName: "",
    empBirth: null,
    empPhone: "",
    empHome: "",
    empEmail: "",
    depId: "",
    jobId: "",
    hireDate: null,
    terminationDate: null,
    salary: "",
  });

  // 부서 및 직무 목록 상태
  const [departments, setDepartments] = useState([]); // 부서 목록
  const [allJobs, setAllJobs] = useState([]); // 전체 직무 목록
  const [filteredJobs, setFilteredJobs] = useState([]); // 선택된 부서에 해당하는 직무

  // 컴포넌트가 처음 렌더링될 때 부서 목록과 직무 목록을 스프링 부트에서 호출
  useEffect(() => {
    // 부서 목록 가져오기
    fetch("http://localhost:8081/api/departments")
      .then((res) => res.json())
      .then((data) =>
        // SelectPicker에서 쓸 수 있게 { label, value } 형태로 가공, 부서 ID, 부서명
        setDepartments(
          data.map((dep) => ({ label: dep.depName, value: dep.depId }))
        )
      );

    // 직무 목록 가져오기
    fetch("http://localhost:8081/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setAllJobs(data); // 직무 전체 저장
      });
  }, []);

  // 부서를 선택했을 때 해당 부서에 속한 직무만 필터링
  const handleDepChange = (depId) => {
    // setForm : form 상태 업데이트, depId 선택시, jobId 초기화 (부서를 다시 선택하면 기존 선택한 직무는 초기화)
    setForm((prev) => ({ ...prev, depId, jobId: "" }));

    const jobsForDep = allJobs
      .filter((job) => job.depId === depId) // 선택된 부서의 직무만 필터링
      .map((job) => ({
        // 데이터 형태를 변환
        label: job.jobName, // label: 화면에 보여질 텍스트
        value: job.jobId, // value: 내부적으로 선택될 값
      }));

    setFilteredJobs(jobsForDep); // 부서에 속한 직무 리스트를 filteredJobs에 저장
  };

  // 모든 입력 필드의 상태를 변경하는 공통 함수
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 등록 버튼 클릭 시 서버로 전송
  const handleSubmit = async () => {
    try {
      const monthly = Number(form.salary || 0); // 월급
      const annual = monthly * 12; // 연봉
      const net = annual * 0.9; // 실수령액 (10% 세금 공제 가정)

      // 서버에 보낼 데이터 구성
      const payload = {
        ...form,
        salary: monthly,
        annualSalary: annual,
        netAnnualSalary: net,
        // form.empBirth ? ... : null | 사용자가 값을 입력 o → form.empBirth.toISOString().split("T")[0] 실행 / 입력 x → null 반환
        // toISOString() : yyyy-mm-dd 형식으로 변환 ( 날짜를 ISO 포맷 문자열)
        // .split("T")[0] : T를 기준으로 자름 (시간 정보는 필요없기 때문에)
        empBirth: form.empBirth
          ? form.empBirth.toISOString().split("T")[0]
          : null,
        hireDate: form.hireDate
          ? form.hireDate.toISOString().split("T")[0]
          : null,
        terminationDate: form.terminationDate
          ? form.terminationDate.toISOString().split("T")[0]
          : null,
      };

      // 사원 정보 POST 요청
      const res = await fetch("http://localhost:8081/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("사원 등록 성공!");
        navigate("/");
      } else {
        alert("등록 실패: " + res.status);
      }
    } catch (err) {
      console.error("등록 에러:", err);
      alert("에러 발생!");
    }
  };

  // 부서 선택 여부에 따라 직무 옵션 분기 처리
  const jobOptions = form.depId
    ? filteredJobs
    : allJobs.map((job) => ({
        label: job.jobName,
        value: job.jobId,
      }));

  return (
    <div className="admin-form-container">
      <Panel header="사원 정보" className="panel-container">
        <Grid fluid>
          <Row className="form-row">
            <Col xs={24} sm={8}>
              <SelectPicker
                placeholder="부서코드"
                data={departments}
                value={form.depId}
                onChange={handleDepChange}
                style={{ width: "100%" }}
                searchable={false}
              />
            </Col>
            <Col xs={24} sm={8}>
              <SelectPicker
                placeholder="직책코드"
                data={jobOptions}
                value={form.jobId}
                onChange={(v) => handleChange("jobId", v)}
                style={{ width: "100%" }}
                searchable={false}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="이름"
                value={form.empName}
                onChange={(v) => handleChange("empName", v)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <DatePicker
                placeholder="생년월일"
                value={form.empBirth}
                onChange={(v) => handleChange("empBirth", v)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="전화번호"
                value={form.empPhone}
                onChange={(v) => handleChange("empPhone", v)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="주소"
                value={form.empHome}
                onChange={(v) => handleChange("empHome", v)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="이메일"
                value={form.empEmail}
                onChange={(v) => handleChange("empEmail", v)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <DatePicker
                placeholder="입사일"
                value={form.hireDate}
                onChange={(v) => handleChange("hireDate", v)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={8}>
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

      <Panel header="급여 정보" className="panel-container">
        <Grid fluid>
          <Row className="form-row">
            <Col xs={24} sm={8}>
              <Input
                type="number"
                placeholder="기본급 (월급)"
                value={form.salary}
                onChange={(v) => handleChange("salary", v)}
              />
              <div style={{ marginTop: "16px" }}>
                <Button
                  appearance="primary"
                  onClick={handleSubmit}
                  style={{ width: "100%" }}
                >
                  저장
                </Button>
              </div>
            </Col>
          </Row>
        </Grid>
      </Panel>
    </div>
  );
}

export default AdminRegister;
