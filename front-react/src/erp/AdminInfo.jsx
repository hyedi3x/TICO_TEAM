import React, { useState } from "react";
import { Table, Button, Input, Panel, Grid, Row, Col } from "rsuite";
import "./adminInfo.css";
import "./admin.css";

const { Column, HeaderCell, Cell } = Table;

function AdminInfo() {
  const [searchResult, setSearchResult] = useState([]);
  const [empId, setEmpId] = useState("");
  const [empName, setEmpName] = useState("");

  const handleSearch = async () => {
    try {
      // 서버로 GET 요청을 보냄 (검색 조건으로 empId, empName 사용)
      const response = await fetch(
        `http://localhost:8081/api/employees/search?empId=${empId}&empName=${empName}`
      );
      console.log("서버 응답 상태:", response.status);
  
      //  응답 상태 코드가 정상(200번대)이 아니면 에러 처리
      if (!response.ok) {
        throw new Error("조회 실패: " + response.status);
      }
  
      // 서버에서 받은 JSON 응답을 자바스크립트 객체로 파싱
      const data = await response.json();
      console.log("서버 응답 데이터:", data);
  
      // 응답 데이터가 배열인지 확인하고, 맞다면 화면에 표시할 데이터로 설정
      if (Array.isArray(data)) {
        setSearchResult(data); // 정상 데이터 => 테이블에 렌더링
      } else {
        // 배열이 아닌 경우 에러 처리
        console.error("응답 데이터 형식 오류:", data);
        setSearchResult([]); // 테이블 비움
      }
    } 
    // fetch 자체 오류나 서버 오류 발생 시 예외 처리    
    catch (error) {
      console.error("조회 실패:", error);
      setSearchResult([]); // 테이블 비움
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

      <Panel header="사원 조회 결과" className="panel-container">
        <div className="table-wrapper">
          <Table
            height={400}          // 테이블 높이 설정
            data={searchResult}   // 표시할 데이터 배열, 조회 결과
            rowKey="empId"        // 각 row(행)의 고유 식별자 - 중복 방지
            wordWrap              // 셀 내용이 길 경우 줄바꿈 허용
            virtualized           // 가상 스크롤 기능 활성화
            rowHeight={50}        // 각 행(row)의 높이 지정
            // 데이터가 없을 때 표시되는 내용 (테이블이 비어 있을 경우)
            renderEmpty={() => (
              <div className="rs-table-empty-message">
                조회된 데이터가 없습니다.
              </div>
            )}
          >
            <Column width={100} align="center" fixed>
              <HeaderCell>사원번호</HeaderCell>
              <Cell dataKey="empId" />
            </Column>
            <Column width={150} align="center">
              <HeaderCell>이름</HeaderCell>
              <Cell dataKey="empName" />
            </Column>
            <Column width={100} align="center">
              <HeaderCell>부서 ID</HeaderCell>
              <Cell dataKey="depId" />
            </Column>
            <Column width={150} align="center">
              <HeaderCell>직책 ID</HeaderCell>
              <Cell dataKey="jobId" />
            </Column>
            <Column width={200} align="center">
              <HeaderCell>이메일</HeaderCell>
              <Cell dataKey="empEmail" />
            </Column>
            <Column width={150} align="center">
              <HeaderCell>전화번호</HeaderCell>
              <Cell dataKey="empPhone" />
            </Column>
            <Column width={250} align="center">
              <HeaderCell>주소</HeaderCell>
              <Cell dataKey="empHome" />
            </Column>
            <Column width={120} align="center">
              <HeaderCell>생년월일</HeaderCell>
              <Cell dataKey="empBirth" />
            </Column>
            <Column width={120} align="center">
              <HeaderCell>월급</HeaderCell>
              <Cell>
                {/* toLocaleString() : 천 단위로 콤마(,)가 들어가게 포맷 */}
                {(rowData) =>
                  rowData.salary ? `${rowData.salary.toLocaleString()} 원` : "-"
                }
              </Cell>
            </Column>
            <Column width={150} align="center">
              <HeaderCell>연봉</HeaderCell>
              <Cell>
                {(rowData) =>
                  rowData.annualSalary
                    ? `${rowData.annualSalary.toLocaleString()} 원`
                    : "-"
                }
              </Cell>
            </Column>
            <Column width={180} align="center">
              <HeaderCell>세후 연봉</HeaderCell>
              <Cell>
                {(rowData) =>
                  rowData.netAnnualSalary
                    ? `${rowData.netAnnualSalary.toLocaleString()} 원`
                    : "-"
                }
              </Cell>
            </Column>
            <Column width={120} align="center">
              <HeaderCell>입사일</HeaderCell>
              <Cell dataKey="hireDate" />
            </Column>
            <Column width={120} align="center">
              <HeaderCell>퇴사일</HeaderCell>
              <Cell dataKey="terminationDate" />
            </Column>
          </Table>
        </div>
      </Panel>
    </div>
  );
}

export default AdminInfo;
