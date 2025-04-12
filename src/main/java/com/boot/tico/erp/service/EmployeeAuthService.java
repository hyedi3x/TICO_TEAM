package com.boot.tico.erp.service;

import com.boot.tico.erp.dto.EmpDTO;
import com.boot.tico.erp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeAuthService {

    private final EmpRepository empRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // 로그인 인증 처리를 수행 (입력 사번과 비밀번호가 일치하는지 확인)
    public Optional<EmpDTO> authenticate(String empId, String rawPassword) {
        Optional<EmpDTO> empOpt = empRepository.findById(empId);
        if (empOpt.isPresent()) {
            EmpDTO emp = empOpt.get();
            // 암호화된 비밀번호와 입력한 평문 비밀번호(rawPassword)를 비교
            // rawPassword.equals(emp.getEmpPwd() : 암호화가 적용되지 않은 비밀번호가 있을 수 있어 평문과 평문 비교를 하는 구문
            if (passwordEncoder.matches(rawPassword, emp.getEmpPwd()) || rawPassword.equals(emp.getEmpPwd())) {
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