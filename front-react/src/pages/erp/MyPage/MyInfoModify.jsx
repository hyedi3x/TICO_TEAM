import React, { useState, useEffect } from "react";
import { Panel, Grid, Row, Col, Input, DatePicker, Button } from "rsuite";
import { useNavigate } from "react-router-dom";
import "./myInfoModify.css";

import axiosInstance from "../../login/social/utils/axiosInstance";

function MyInfoModify() {
  // user_uuid를 localStorage에서 받아옴
  const empId = localStorage.getItem("user_uuid");

  const navigate = useNavigate();

  // 화면에 보여질 폼 변수 선언
  const [form, setForm] = useState({
    empName: "",
    empPwd: "", // 비밀번호는 항상 빈 값으로 초기화
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

  // 컴포넌트가 처음 렌더링될 때, empId에 해당하는 사원 정보를 스프링 부트에서 호출
  useEffect(() => {
    if (empId) {
      axiosInstance.get(`/api/empId/${empId}`)
        .then((res) => {
          const data = res.data;
          setForm({
            empName: data.empName,
            empPwd: "", // 비밀번호는 조회 시 빈 값으로 설정, 암호화된 비밀번호를 조회하지 못하게 하려고(보안상 권장)
            empBirth: data.empBirth ? new Date(data.empBirth) : null,
            empPhone: data.empPhone,
            empHome: data.empHome,
            empEmail: data.empEmail,
            depId: data.depId,
            jobId: data.jobId,
            hireDate: data.hireDate ? new Date(data.hireDate) : null,
            terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
            salary: data.salary,
          });
        })
        .catch((err) => {
          console.error("사원 정보 조회 실패", err);
        });
    }
  }, [empId]);

  // 폼(form) 데이터를 조회
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value })); // field: 바꾸려는 필드의 이름, value: 그 필드에 들어갈 값
  };

  // 비밀번호 유효성 검사: 대문자, 소문자, 숫자, 특수문자 포함, 8자 이상
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // 필수 입력 필드 체크
  const handleSubmit = async () => {
    if (!form.empName || !form.empBirth || !form.empPhone || !form.empEmail) {
      alert("이름, 생년월일, 전화번호, 이메일은 필수 입력 사항입니다.");
      return;
    }

    if (!form.empPwd) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    // 비밀번호 유효성 검사 함수 호출
    if (!validatePassword(form.empPwd)) {
      alert(
        "비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다."
      );
      return;
    }

    try {
      // 월급을 숫자 타입으로 변환 후 연봉 계산
      const monthly = Number(form.salary || 0); // 월급
      const annual = monthly * 12; // 연봉
      const net = annual * 0.9; // 세후 연봉 계산(10% 세금 공제 가정)
      
      // 날짜(Date 객체)를 서버에 보낼 때 YYYY-MM-DD 형식의 문자열로 변환
      const payload = {
        ...form,
        salary: monthly,
        annualSalary: annual,
        netAnnualSalary: net,
        empBirth: form.empBirth ? form.empBirth.toISOString().split("T")[0]: null,
        hireDate: form.hireDate ? form.hireDate.toISOString().split("T")[0]: null,
        terminationDate: form.terminationDate ? form.terminationDate.toISOString().split("T")[0]: null,
      };

      console.log("전송될 payload:", payload); // 최종 제출될 데이터 로그로 확인(디버깅 용)

      // POST	: 새로운 자원 생성, PUT :	전체 자원 수정 또는 대체, PATCH :	자원의 "일부"만 수정
      // 사용자가 수정한 사원 정보를 서버에 PUT 방식으로 전송해서 DB에 업데이트
      const res = await axiosInstance.put(`/api/employees/${empId}`, payload);

      if (res.ok) {
        alert("사원 정보 수정 성공!");
        navigate("/erpMain"); // 성공 시 페이지 이동 (erpMain 오른쪽 화면이라 페이지가 이동 안되는 것처럼 보임)
      } else {
        const errText = await res.text();
        alert("수정 실패: " + res.status + "\n" + errText);
      }
    } catch (err) {
      alert("에러 발생!");
    }
  };

  // Daum 우편번호 서비스 호출 함수
  const openDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setForm((prev) => ({ ...prev, empHome: data.address }));
      },
    }).open();
  };

  // Daum 우편번호 스크립트 추가
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="admin-form-container">
      <Panel header="내 정보 수정" className="panel-container">
        <h5 className="section-title">기본정보</h5>
        <Grid fluid>
          <Row className="form-row2">
            <Col sm={6}>
              <Input placeholder="이름" value={form.empName} onChange={(v) => handleChange("empName", v)} />
            </Col>
            <Col sm={12}>
              <Input
                placeholder="비밀번호 재설정 (영문, 숫자, 특수문자 조합)"
                type="password"
                value={form.empPwd}
                onChange={(v) => handleChange("empPwd", v)}
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
              <Input placeholder="전화번호" value={form.empPhone} onChange={(v) => handleChange("empPhone", v)} />
            </Col>
            <Col sm={6}>
              <Input placeholder="이메일" value={form.empEmail} onChange={(v) => handleChange("empEmail", v)} />
            </Col>
          </Row>
        </Grid>

        <h5 className="section-title">주소 정보</h5>
        <Grid fluid>
          <Row className="form-row2">
            <Col sm={17}>
              <Input placeholder="주소" value={form.empHome} onChange={(v) => handleChange("empHome", v)} />
            </Col>
            <Col sm={6}>
              <button className="search-btn" onClick={openDaumPostcode}>
                주소 검색
              </button>
            </Col>
          </Row>
        </Grid>

        <div className="save-btn-wrap">
          <Button className="submit-btn" onClick={handleSubmit}>
            저장
          </Button>
        </div>
      </Panel>
    </div>
  );
}

export default MyInfoModify;
