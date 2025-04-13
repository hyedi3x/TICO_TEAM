package com.boot.tico.erp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.boot.tico.erp.dto.DepDTO;
import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.dto.JobDTO;
import com.boot.tico.erp.repo.DepRepository;
import com.boot.tico.erp.repo.EmpRepository;
import com.boot.tico.erp.repo.JobRepository;

@Service
public class ErpService {

    @Autowired private EmpRepository empRepo;
    @Autowired private DepRepository depRepo;
    @Autowired private JobRepository jobRepo;

    @Autowired
    private PasswordEncoder passwordEncoder; // 비밀번호 암호화를 위한 인코더
    
    // 부서 전체 조회
    public List<DepDTO> getAllDep() {
        return depRepo.findAll();
    }
    
    // 부서명 검색
    public List<DepDTO> searchDep(String keyword) {
        return depRepo.findByDepNameContainingIgnoreCase(keyword); 
    }
    
    // 직무 전체 조회
    public List<JobDTO> getAllJobs() {
        return jobRepo.findAll(); 
    }
    
    // 사원 등록 (empId 자동 생성)
    public EmpDTO saveEmp(EmpDTO emp) {
    	// empId가 없으면, generateNextEmpId() 호출 (input이 없기 때문에 무조건 null)
        if (emp.getEmpId() == null || emp.getEmpId().isEmpty()) {
            String nextEmpId = generateNextEmpId();
            emp.setEmpId(nextEmpId);
        }
        return empRepo.save(emp);  // empId 저장
    }

    // 사번 자동 증가(empId +1 생성)
    public String generateNextEmpId() {
        String maxIdStr = empRepo.findMaxEmpId(); // 현재 가장 큰 사번 가져오기
        // 사번이 존재하지 않으면 10001부터 시작
        int nextId = (maxIdStr != null && maxIdStr.matches("\\d+")) ? Integer.parseInt(maxIdStr) + 1 : 10001;
        return String.valueOf(nextId);
    }

    // 전체 사원 조회
    public List<EmpDTO> getAllEmp() {
        return empRepo.findAll();
    }
    
    // 사원 검색 (조건별 분기)
    public List<EmpDTO> getEmployees(String empId, String empName) {
    	// empId + empName 둘 다 있으면
        if (empId != null && !empId.isEmpty() && empName != null && !empName.isEmpty()) {
            return empRepo.findByEmpIdAndEmpName(empId, empName);
        } 
        
        // empId만 있으면
        else if (empId != null && !empId.isEmpty()) {
            return empRepo.findByEmpId(empId);
        } 
        
        // empName만 있으면
        else if (empName != null && !empName.isEmpty()) {
            return empRepo.findByEmpNameContaining(empName);
        } 
        
        // 아무 것도 없으면 
        else {
            return empRepo.findAll();
        }
    }
    
    // 사원 정보 업데이트
    public void updateEmployee(EmpDTO empDTO) {
        empDTO.setEmpPwd(passwordEncoder.encode(empDTO.getEmpPwd())); // 비밀번호 암호화
        empRepo.save(empDTO); // 업데이트된 사원 정보 저장
    }
    
    // 사원 삭제
    public boolean deleteEmployee(String empId) {
    	// ID(사번)를 가진 데이터가 DB에 존재하는지 확인
        if (empRepo.existsById(empId)) {
            empRepo.deleteById(empId);  // empId가 존재하면 해당 사원 데이터를 삭제
            return true;
        }
        return false;
    }
}