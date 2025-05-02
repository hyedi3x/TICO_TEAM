package com.boot.tico.erp.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.boot.tico.erp.dto.EmpDTO;

@Repository
public interface EmpRepository extends JpaRepository<EmpDTO, String> {
	
	// 단건 조회 (empId 고유한 값)
	// 반환값이 Optional<T> 결과가 없을 때 null 대신 Optional.empty()로 처리 가능. NullPointerException을 줄임.
	Optional<EmpDTO> findFirstByEmpId(String empId);
	
	// 사원번호(empId)와 정확히 일치하는 사원 정보를 조회 (empId로 여러 건이 조회될 수 있음)
	// List<EmpDTO> → 0개 이상
    List<EmpDTO> findByEmpId(String empId);
    
    // 사원이름(empName)이 포함된 모든 사원 정보를 조회 (부분 검색 가능)
    List<EmpDTO> findByEmpNameContaining(String empName);
    
    // 사원번호(empId)와 사원이름(empName)이 정확히 일치하는 사원 정보를 조회
    List<EmpDTO> findByEmpIdAndEmpName(String empId, String empName); 
    
    // empId의 max값 조회
    @Query("SELECT MAX(e.empId) FROM EmpDTO e")
    String findMaxEmpId();
    
    // 해당 empId가 employees 테이블에 존재하는지 확인하는 메서드
    boolean existsByEmpId(String empId);
}

