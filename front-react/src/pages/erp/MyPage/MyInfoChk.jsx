import React, { useState, useEffect } from 'react';
import { Panel, Grid, Row, Col, Input, SelectPicker } from "rsuite";  // rsuite UI 라이브러리에서 제공하는 컴포넌트들
import "../HR_Team/adminRegister.css";

function MyInfoChk() {

  // 폼 변수 선언
  const [form, setForm] = useState({
    empName: "",
    empPwd: "", 
    empBirth: "",  // Date 객체에서 문자열로 변경
    empPhone: "", 
    empHome: "",
    empEmail: "", 
    depId: "",
    jobId: "", 
    hireDate: "",  // Date 객체에서 문자열로 변경
    terminationDate: "",  // Date 객체에서 문자열로 변경
    salary: "",
  });

  // 부서와 직무 옵션을 가져오기 위한 상태들
  const [departments, setDepartments] = useState([]); // 부서 목록
  const [allJobs, setAllJobs] = useState([]);         // 전체 직무 목록

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
      });
  
    // 직무 목록을 가져오는 요청
    fetch("http://localhost:8081/api/jobs")
      .then((res) => res.json())
      .then((data) => setAllJobs(data)); // 직무 전체 목록을 가져와 저장
  }, []);
  
  // 폼 데이터 조회용
  useEffect(() => {
    const empId = localStorage.getItem("user_uuid");  // 로컬스토리지에서 로그인된 사원의 ID를 가져옵니다.
    if (empId) {
      fetch(`http://localhost:8081/api/empId/${empId}`)
        .then((res) => res.json())
        .then((data) => {
          setForm({
            empName: data.empName,
            empPwd: data.empPwd,
            empBirth: data.empBirth ? data.empBirth.split("T")[0] : "",  // 문자열로 변환 (YYYY-MM-DD 형식)
            empPhone: data.empPhone,
            empHome: data.empHome,
            empEmail: data.empEmail,
            depId: data.depId,
            jobId: data.jobId, // 이미 직무 ID가 주어짐
            hireDate: data.hireDate ? data.hireDate.split("T")[0] : "",  // 문자열로 변환
            terminationDate: data.terminationDate ? data.terminationDate.split("T")[0] : "",  // 문자열로 변환
            salary: data.salary,
          });
        })
        .catch((err) => {
          console.error("사원 정보 조회 실패", err);
        });
    }
  }, []);

  // 수정 불가능하도록 readonly 처리
  const handleReadonly = () => ({
    readOnly: true
  });

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
                value={form.depId || ""}
                style={{ width: "100%" }}
                searchable={false}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <SelectPicker
                placeholder="직책코드"
                data={allJobs.map((job) => ({ label: job.jobName, value: job.jobId }))}  // allJobs에서 직무 리스트를 바로 사용
                value={form.jobId || ""}
                style={{ width: "100%" }}
                searchable={false}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="사원 비밀번호 (이름+월일)"
                type="password"
                value={form.empPwd || ""}
                style={{ width: "100%" }}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="기본급 (월급)"
                type="number"
                value={form.salary || ""}
                style={{ width: "100%" }}
                {...handleReadonly()}  // readonly 처리
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
                value={form.empName || ""}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="생년월일"
                value={form.empBirth || ""}
                style={{ width: "100%" }}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="전화번호"
                value={form.empPhone || ""}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="이메일"
                value={form.empEmail || ""}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="입사일"
                value={form.hireDate || ""}
                style={{ width: "100%" }}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
            <Col sm={6}>
              <Input
                placeholder="퇴사일"
                value={form.terminationDate || ""}
                style={{ width: "100%" }}
                {...handleReadonly()}  // readonly 처리
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
                value={form.empHome || ""}
                style={{ width: "100%" }}
                {...handleReadonly()}  // readonly 처리
              />
            </Col>
          </Row>
        </Grid>
      </Panel>
    </div>
  );
}

export default MyInfoChk;
