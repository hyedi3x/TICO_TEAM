import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Panel,
  Grid,
  Row,
  Col,
  Modal,
  DatePicker,
  SelectPicker,
} from "rsuite";
import "./adminInfo.css";
import "./adminContainer.css";

import axiosInstance from "../../login/social/utils/axiosInstance";

const { Column, HeaderCell, Cell } = Table;

function AdminInfo() {
  const [searchResult, setSearchResult] = useState([]);
  const [empId, setEmpId] = useState(""); // 빈 문자열로 초기화
  const [empName, setEmpName] = useState(""); // 빈 문자열로 초기화
  const [editModal, setEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  // 서버로 GET 요청을 보내 사원 정보를 검색 (조회 버튼 클릭 시)
  const handleSearch = async () => {
    try {
      const response = await axiosInstance.get(`/api/employees/search?empId=${empId}&empName=${empName}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setSearchResult(data);
      } else {
        console.error("응답 데이터 형식 오류:", data);
        setSearchResult([]);
      }
    } catch (error) {
      console.error("조회 실패:", error);
      setSearchResult([]);
    }
  };

  // 수정 버튼 클릭 시 호출되는 함수
  const handleEdit = (emp) => {
    console.log(emp);
    const empWithDateObjects = {
      ...emp,
      empBirth: emp.empBirth ? new Date(emp.empBirth) : null,
      hireDate: emp.hireDate ? new Date(emp.hireDate) : null,
      terminationDate: emp.terminationDate ? new Date(emp.terminationDate) : null,
    };
    setSelectedEmp(empWithDateObjects);
    setEditModal(true);

    const jobsForDep = allJobs
      .filter((job) => job.depId === emp.depId)
      .map((job) => ({ label: job.jobName, value: job.jobId }));
    setFilteredJobs(jobsForDep);
  };

  // 삭제 버튼 클릭 시 호출되는 함수
  const handleDelete = async (empId) => {
    const confirmDelete = window.confirm("정말로 이 관리자를 삭제하시겠습니까?");
    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(`/api/employees/${empId}`);
        alert("삭제 성공!");
        handleSearch();
      } catch (error) {
        console.error("삭제 실패:", error);
      }
    }
  };

  // 수정된 데이터를 서버에 저장하는 함수
  const handleSave = async () => {
    try {
      const response = await axiosInstance.put(`/api/employees/${selectedEmp.empId}`, selectedEmp);
      alert("수정 성공!");
      setEditModal(false);
      handleSearch();
    } catch (error) {
      console.error("수정 실패:", error);
    }
  };

  // 부서 선택 시 직무 목록 필터링
  const handleDepChange = (depId) => {
    setSelectedEmp((prev) => ({ ...prev, depId, jobId: "" }));

    const jobsForDep = allJobs
      .filter((job) => job.depId === depId)
      .map((job) => ({ label: job.jobName, value: job.jobId }));
    console.log("필터링된 직무:", jobsForDep);
    setFilteredJobs(jobsForDep);
  };

  // 입력 값 변화 시 상태 업데이트
  const handleChange = (field, value) => {
    setSelectedEmp((prev) => ({ ...prev, [field]: value }));
  };

  // 부서 및 직무 데이터 로드
  useEffect(() => {
    axiosInstance.get("/api/departments")
      .then((res) => {
        const departmentOptions = res.data.map((dep) => ({
          label: dep.depName,
          value: dep.depId,
        }));
        setDepartments(departmentOptions);
      });

    axiosInstance.get("/api/jobs")
      .then((res) => setAllJobs(res.data));

    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 주소 검색을 위한 Daum 우편번호 서비스 호출
  const openDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setSelectedEmp((prev) => ({ ...prev, empHome: data.address }));
      },
    }).open();
  };

  return (
    <div className="admin-form-container">
      <Panel header="사원 조회" className="panel-container">
        <Grid fluid>
          <Row className="form-row2">
            <Col xs={6}>
              <Input
                placeholder="사원번호"
                value={empId}
                onChange={(value) => setEmpId(value)}
              />
            </Col>
            <Col xs={6}>
              <Input
                placeholder="사원이름"
                value={empName}
                onChange={(value) => setEmpName(value)}
              />
            </Col>
            <Col xs={6}>
              <Button appearance="primary" onClick={handleSearch} block>
                조회
              </Button>
            </Col>
          </Row>
        </Grid>
      </Panel>

      <Panel header="사원 조회 결과" className="panel-container" style={{ height: "650px"}} >
        <div className="HR-table-wrapper">
          <Table
            height={600}
            data={searchResult}
            rowKey="empId"
            wordWrap
            virtualized
            rowHeight={50}
            renderEmpty={() => (
              <div className="rs-table-empty-message">
                조회된 데이터가 없습니다.
              </div>
            )}
          >
            {/* 테이블 컬럼 정의 */}
            <Column width={100} align="center" fixed><HeaderCell>사원번호</HeaderCell><Cell dataKey="empId" /></Column>
            <Column width={150} align="center"><HeaderCell>이름</HeaderCell><Cell dataKey="empName" /></Column>
            <Column width={90} align="center"><HeaderCell>부서 ID</HeaderCell><Cell dataKey="depId" /></Column>
            <Column width={100} align="center"><HeaderCell>직책 ID</HeaderCell><Cell dataKey="jobId" /></Column>
            <Column width={180} align="center"><HeaderCell>이메일</HeaderCell><Cell dataKey="empEmail" /></Column>
            <Column width={140} align="center"><HeaderCell>전화번호</HeaderCell><Cell dataKey="empPhone" /></Column>
            <Column width={250} align="center"><HeaderCell>주소</HeaderCell><Cell dataKey="empHome" /></Column>
            <Column width={120} align="center"><HeaderCell>생년월일</HeaderCell><Cell dataKey="empBirth" /></Column>
            <Column width={110} align="center"><HeaderCell>월급</HeaderCell>
              <Cell>
                {(rowData) =>
                  rowData.salary ? `${rowData.salary.toLocaleString()} 원` : "-"
                }
              </Cell>
            </Column>
            <Column width={130} align="center"><HeaderCell>연봉</HeaderCell>
              <Cell>
                {(rowData) =>
                  rowData.annualSalary
                    ? `${rowData.annualSalary.toLocaleString()} 원`
                    : "-"
                }
              </Cell>
            </Column>
            <Column width={130} align="center"><HeaderCell>세후 연봉</HeaderCell>
              <Cell>
                {(rowData) =>
                  rowData.netAnnualSalary
                    ? `${rowData.netAnnualSalary.toLocaleString()} 원`
                    : "-"
                }
              </Cell>
            </Column>
            <Column width={120} align="center"><HeaderCell>입사일</HeaderCell><Cell dataKey="hireDate" /></Column>
            <Column width={120} align="center"><HeaderCell>퇴사일</HeaderCell><Cell dataKey="terminationDate" /></Column>
            <Column width={140} align="center" fixed="right"><HeaderCell>작업</HeaderCell>
              <Cell>
                {(rowData) => (  // rowData : 현재 행의 전체 데이터 객체
                  <>
                    <Button onClick={() => handleEdit(rowData)} style={{background:"#82bcf8", color: "#fff"}}> 수정 </Button>
                    &nbsp;&nbsp; {/* 띄어쓰기 */}
                    <Button onClick={() => handleDelete(rowData.empId)}>삭제</Button>
                  </>
                )}
              </Cell>
            </Column>
          </Table>
        </div>
      </Panel>

      {/* 수정 모달 창 구현*/}
      {/* open : editModal 값이 true일 때 */}
      {/* onClose={() => setEditModal(false)} : 사용자가 모달을 닫으려고 할 때 실행되는 함수 */}
      <Modal open={editModal} onClose={() => setEditModal(false)} size="lg"> {/*large size*/}
        <Modal.Header>
          <Modal.Title>사원 정보 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmp && (
            <Grid fluid>
              <Row className="form-row2">
                <Col sm={4}>
                  <SelectPicker
                    placeholder="부서코드"
                    data={departments}
                    value={selectedEmp.depId || ""}
                    onChange={handleDepChange}
                    style={{ width: "100%" }}
                    searchable={false}
                  />
                </Col>
                <Col sm={4}>
                  <SelectPicker
                    placeholder="직책코드"
                    data={filteredJobs}
                    value={selectedEmp.jobId || ""}
                    onChange={(v) => handleChange("jobId", v)}
                    style={{ width: "100%" }}
                    searchable={false}
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    placeholder="기본급 (월급)"
                    type="number"
                    value={
                      selectedEmp.salary ? selectedEmp.salary.toString() : ""
                    }
                    onChange={(v) =>
                      handleChange("salary", parseInt(v.replace(/,/g, ""), 10))
                    }
                    style={{ width: "100%" }}
                  />
                </Col>

                <Col sm={9}>
                  <Input
                    placeholder="사원 비밀번호"
                    type="password"
                    value={selectedEmp.empPwd || ""}
                    onChange={(v) => handleChange("empPwd", v)}
                    style={{ width: "100%" }}
                  />
                </Col>
              </Row>
              <Row className="form-row2">
                <Col sm={4}>
                  <Input
                    placeholder="이름"
                    value={selectedEmp.empName || ""}
                    onChange={(v) => handleChange("empName", v)}
                  />
                </Col>
                <Col sm={4}>
                  <DatePicker
                    placeholder="생년월일"
                    value={selectedEmp.empBirth || null}
                    onChange={(v) => handleChange("empBirth", v)}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    placeholder="전화번호"
                    value={selectedEmp.empPhone || ""}
                    onChange={(v) => handleChange("empPhone", v)}
                  />
                </Col>
                <Col sm={5}>
                  <Input
                    placeholder="이메일"
                    value={selectedEmp.empEmail || ""}
                    onChange={(v) => handleChange("empEmail", v)}
                  />
                </Col>
                <Col sm={4}>
                  <DatePicker
                    placeholder="입사일"
                    value={selectedEmp.hireDate || null}
                    onChange={(v) => handleChange("hireDate", v)}
                    style={{ width: "100%" }}
                  />
                </Col>
              </Row>
              <Row className="form-row2">
                <Col sm={4}>
                  <DatePicker
                    placeholder="퇴사일"
                    value={selectedEmp.terminationDate || null}
                    onChange={(v) => handleChange("terminationDate", v)}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col sm={14}>
                  <Input
                    placeholder="주소"
                    value={selectedEmp.empHome || ""}
                    onChange={(v) => handleChange("empHome", v)}
                    style={{ width: "102%" }}
                  />
                </Col>
                <Col sm={4}>
                  <Button
                    onClick={openDaumPostcode}
                    appearance="default"
                    style={{ width: "100%", marginLeft: "10px" }}
                  >
                    주소 검색
                  </Button>
                </Col>
              </Row>
            </Grid>
          )}
        </Modal.Body>

        {/* 저장/취소 */}
        <Modal.Footer>
          <Button onClick={handleSave} appearance="primary">저장</Button>
          <Button onClick={() => setEditModal(false)} appearance="subtle">취소</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminInfo;
