package com.boot.tico.erp.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.erp.dto.EmpDTO;

@Repository
public interface EmpRepository extends JpaRepository<EmpDTO, String> {
	// 사원번호(empId)와 정확히 일치하는 사원 정보를 조회
    List<EmpDTO> findByEmpId(String empId);
    
    // 사원이름(empName)이 포함된 모든 사원 정보를 조회 (부분 검색 가능)
    List<EmpDTO> findByEmpNameContaining(String empName);
    
    // 사원번호(empId)와 사원이름(empName)이 정확히 일치하는 사원 정보를 조회
    List<EmpDTO> findByEmpIdAndEmpName(String empId, String empName); 
    
    // empId의 max값 조회
    @Query("SELECT MAX(e.empId) FROM EmpDTO e")
    String findMaxEmpId();
}

