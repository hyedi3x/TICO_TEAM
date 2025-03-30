package com.boot.tico.erp.controller;

import java.util.List;

import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.service.ErpService;

@CrossOrigin(origins = "http://localhost:3000") // React 서버 주소
@RestController
@RequestMapping("/api/employees")
public class ErpController {
    private static final Logger logger = Logger.getLogger(ErpController.class.getName());

    @Autowired
    private ErpService erpService;

    // 전체 데이터를 반환하는 엔드포인트
    @GetMapping("/all")
    public List<EmpDTO> getAllEmployees() {
        return erpService.getAllEmployees(); // 서비스에서 전체 데이터 반환
    }

    // empId로 데이터를 반환하는 엔드포인트
    @GetMapping("/search")
    public List<EmpDTO> searchByEmpId(@RequestParam String empId) {
        return erpService.getEmployeeByEmpId(empId); // 서비스에서 empId로 조회된 데이터 반환
    }

}
