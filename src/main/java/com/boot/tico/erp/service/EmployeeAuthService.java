package com.boot.tico.erp.service;

import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeAuthService {

    private final EmpRepository empRepository;

    // ✔ 개발용: 평문 비밀번호 비교 (운영환경 X)
    public Optional<EmpDTO> authenticate(String empId, String rawPassword) {
        Optional<EmpDTO> empOpt = empRepository.findById(empId);
        if (empOpt.isPresent()) {
            EmpDTO emp = empOpt.get();

            // 👉 평문 비교
            if (rawPassword.equals(emp.getEmp_pwd())) {
                return Optional.of(emp);
            } else {
                log.warn("비밀번호 불일치: empId={}", empId);
            }

        } else {
            log.warn("사원 정보 없음: empId={}", empId);
        }
        return Optional.empty();
    }
    
    public Optional<EmpDTO> findByEmpId(String empId) {
        return empRepository.findById(empId);
    }
}
    
    
    
//    private final PasswordEncoder passwordEncoder;
//    
//    // 입력된 empId와 비밀번호(rawPassword)를 검증하는 메서드
//    public Optional<EmpDTO> authenticate(String empId, String rawPassword) {
//        Optional<EmpDTO> empOpt = empRepository.findById(empId);
//        if (empOpt.isPresent()) {
//            EmpDTO emp = empOpt.get();
//            if (passwordEncoder.matches(rawPassword, emp.getEmp_pwd())) {
//                return Optional.of(emp);
//            } else {
//                log.warn("비밀번호 불일치: empId={}", empId);
//            }
//        } else {
//            log.warn("사원 정보 없음: empId={}", empId);
//        }
//        return Optional.empty();
//    }
//}
