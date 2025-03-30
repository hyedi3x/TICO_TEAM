package com.boot.tico.erp.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.tico.erp.dto.EmpDTO;

@Repository
public interface EmpRepository extends JpaRepository<EmpDTO, String> {
    // empId로 검색하는 메서드
    List<EmpDTO> findByEmpId(String empId);
    
    // 전체 데이터 검색 메서드 (기본적으로 JpaRepository에서 제공)
    List<EmpDTO> findAll();
}
