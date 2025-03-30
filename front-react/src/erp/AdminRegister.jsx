import React, { useState } from "react";
import { Table, Button, Input, Panel, Grid, Row, Col } from 'rsuite';
import { useFormik } from 'formik';
import './admin.css';

const { Column, HeaderCell, Cell } = Table;

function AdminRegister() {
  const [searchResult, setSearchResult] = useState([]);
  const [empId, setEmpId] = useState('');

  const formik = useFormik({
    initialValues: {
      emp_id: '',
      emp_name: '',
      emp_birth: null,
      emp_phone: '',
      emp_home: '',
      emp_email: '',
      dep_id: '',
      job_id: '',
      hire_date: null,
      termination_date: null,
      salary: '',
      annual_salary: '',
      net_annual_salary: '',
    },
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    }
  });

  // 검색 함수 (여기서는 더미 데이터 사용)
  const handleSearch = () => {
    const dummyData = [
      {
        id: "12345",
        firstName: "홍길동",
        lastName: "홍",
        gender: "남",
        age: 30,
        city: "서울시 강남구",
        email: "hong@example.com"
      },
      // 여기에 추가적인 더미 데이터를 넣을 수 있음
    ];

    setSearchResult(dummyData);
  };

  return (
    <div className="admin-form-container">
      <form onSubmit={formik.handleSubmit}>
        <Grid fluid>
          <Row className="form-row">
            <Col xs={6}>
              <Input
                name="emp_id"
                placeholder="사원번호"
                value={formik.values.emp_id}
                onChange={value => formik.setFieldValue('emp_id', value)}
              />
            </Col>
            <Col xs={6}>
              <Input
                name="emp_name"
                placeholder="이름"
                value={formik.values.emp_name}
                onChange={value => formik.setFieldValue('emp_name', value)}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={24}>
              <Button appearance="primary" onClick={handleSearch} block>
                조회
              </Button>
            </Col>
          </Row>
        </Grid>
      </form>

      <Panel header="사원 조회 결과" className="panel-container">
        <Table virtualized height={400} data={searchResult}>
          <Column width={100} align="center" fixed>
            <HeaderCell>사원번호</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={150}>
            <HeaderCell>이름</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={150}>
            <HeaderCell>성</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={100}>
            <HeaderCell>성별</HeaderCell>
            <Cell dataKey="gender" />
          </Column>

          <Column width={100}>
            <HeaderCell>나이</HeaderCell>
            <Cell dataKey="age" />
          </Column>

          <Column width={200}>
            <HeaderCell>주소</HeaderCell>
            <Cell dataKey="city" />
          </Column>

          <Column width={200}>
            <HeaderCell>이메일</HeaderCell>
            <Cell dataKey="email" />
          </Column>
        </Table>
      </Panel>
    </div>
  );
}

export default AdminRegister;
