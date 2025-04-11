package com.boot.tico.erp.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.erp.dto.DepDTO;
import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.dto.JobResponseDTO;
import com.boot.tico.erp.service.ErpNotiService;
import com.boot.tico.erp.service.ErpService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class ErpController {

    private static final Logger logger = LoggerFactory.getLogger(ErpController.class);

    @Autowired
    private ErpService erpService;
    
    @Autowired
    private ErpNotiService erpNotiService;
    
    // 부서 목록 전체
    @GetMapping("/departments")
    public List<DepDTO> getDepartments(@RequestParam(required = false) String keyword) {
        // keyword가 null이면 getAllDepartments()함수 실행, 값이 있으면 searchDepartments(keyword) 실행
    	return (keyword == null || keyword.isEmpty()) ?
                erpService.getAllDep() : erpService.searchDep(keyword);
    }

    // 직무 목록 전체
    @GetMapping("/jobs")
    public List<JobResponseDTO> getJobs() {
        return erpService.getAllJobs().stream()   // stream(): 리스트 안의 데이터를 하나씩 꺼내서 반복 처리
                .map(JobResponseDTO::new)         // JobDTO 객체 하나하나를 JobResponseDTO로 변환
                .collect(Collectors.toList());    // 변환된 결과를 리스트로 다시 모아주는 작업
    }

    // 사원 등록
    @PostMapping("/employees")
    // @RequestBody EmpDTO employee : JSON 데이터를 EmpDTO 객체로 자동 변환
    public EmpDTO createEmployee(@RequestBody EmpDTO employee) {
        logger.info("등록 요청 - 이름: {}, 이메일: {}", employee.getEmpName(), employee.getEmpEmail());
        return erpService.saveEmp(employee);
    }

    // 전체 사원 목록 조회
    @GetMapping("/all")
    public List<EmpDTO> getAllEmployees() {
        return erpService.getAllEmp();
    }

    // 사원 검색 (사원명, 사원번호)
    @GetMapping("/employees/search")
    public List<EmpDTO> searchEmployees(@RequestParam(required = false) String empId,
                                        @RequestParam(required = false) String empName) {
        return erpService.getEmployees(empId, empName);
    }
    
    // 사원별 depId 조회
    @GetMapping("/user/depId/{empId}")
    public ResponseEntity<EmpDTO> getEmpInfo(@PathVariable String empId) {
        EmpDTO emp = erpNotiService.getEmployeeById(empId);
        if (emp != null) {
            return ResponseEntity.ok(emp);		// HTTP 200 + body에 emp 반환
        } else {
            return ResponseEntity.notFound().build();	 // HTTP 404 반환
        }
    }
}
