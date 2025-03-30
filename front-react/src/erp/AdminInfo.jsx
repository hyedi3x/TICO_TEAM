import React, { useState } from "react";
import { Table, Button, Input, Panel, Grid, Row, Col } from 'rsuite';
import './admin.css';

const { Column, HeaderCell, Cell } = Table;

function AdminInfo() {
  const [searchResult, setSearchResult] = useState([]);
  const [empId, setEmpId] = useState('');

  // API 호출하여 사원 정보 조회
  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/employees/search?empId=${empId}`);
      console.log("서버 응답 상태:", response.status);
  
      if (!response.ok) {
        throw new Error("조회 실패: " + response.status);
      }
  
      const data = await response.json();
      console.log("서버 응답 데이터:", data);
  
      // 응답이 배열 형태인지 확인
      if (Array.isArray(data)) {
        setSearchResult(data);
      } else {
        console.error("응답 데이터 형식 오류:", data);
        setSearchResult([]); // 잘못된 형식의 응답 처리
      }
    } catch (error) {
      console.error("조회 실패:", error);
      setSearchResult([]); // 에러 발생 시 빈 배열 반환
    }
  };
  

  return (
    <div className="admin-form-container">
      <Panel header="사원 조회" className="panel-container">
        <Grid fluid>
          <Row className="form-row">
            <Col xs={6}>
              <Input
                placeholder="사원번호"
                value={empId}
                onChange={value => setEmpId(value)}
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

      <Panel header="사원 조회 결과" className="panel-container">
        <Table virtualized height={400} data={searchResult}>
          <Column width={100} align="center" fixed>
            <HeaderCell>사원번호</HeaderCell>
            <Cell dataKey="empId" />
          </Column>

          <Column width={150}>
            <HeaderCell>이름</HeaderCell>
            <Cell dataKey="empName" />
          </Column>

          <Column width={150}>
            <HeaderCell>부서 ID</HeaderCell>
            <Cell dataKey="depId" />
          </Column>

          <Column width={150}>
            <HeaderCell>직책 ID</HeaderCell>
            <Cell dataKey="jobId" />
          </Column>

          <Column width={200}>
            <HeaderCell>이메일</HeaderCell>
            <Cell dataKey="empEmail" />
          </Column>

          <Column width={150}>
            <HeaderCell>전화번호</HeaderCell>
            <Cell dataKey="empPhone" />
          </Column>

          <Column width={200}>
            <HeaderCell>주소</HeaderCell>
            <Cell dataKey="empHome" />
          </Column>

          <Column width={150}>
            <HeaderCell>생년월일</HeaderCell>
            <Cell dataKey="empBirth" />
          </Column>

          <Column width={120}>
            <HeaderCell>입사일</HeaderCell>
            <Cell dataKey="hireDate" />
          </Column>

          <Column width={120}>
            <HeaderCell>퇴사일</HeaderCell>
            <Cell dataKey="terminationDate" />
          </Column>

          <Column width={120}>
            <HeaderCell>월급</HeaderCell>
            <Cell dataKey="salary" />
          </Column>

          <Column width={120}>
            <HeaderCell>연봉</HeaderCell>
            <Cell dataKey="annualSalary" />
          </Column>

          <Column width={120}>
            <HeaderCell>실수령액</HeaderCell>
            <Cell dataKey="netAnnualSalary" />
          </Column>
        </Table>
      </Panel>
    </div>
  );
}

export default AdminInfo;
