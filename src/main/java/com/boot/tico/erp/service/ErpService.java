package com.boot.tico.erp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.repo.EmpRepository;

@Service
public class ErpService {
    @Autowired
    private EmpRepository empRepo;

    // 전체 데이터를 반환하는 메서드
    public List<EmpDTO> getAllEmployees() {
        return empRepo.findAll(); // 전체 데이터를 반환
    }

    // empId로 특정 직원 찾는 메서드
    public List<EmpDTO> getEmployeeByEmpId(String empId) {
    	List<EmpDTO> result = empRepo.findByEmpId(empId);
        System.out.println("조회된 데이터: " + result);  // 결과를 출력
        return result;
    }
}
