package com.boot.tico.erp.dto;

import java.math.BigDecimal;
import java.util.Date;
import javax.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//@NoArgsConstructor : 기본 생성자, @AllArgsConstructor: 모든 필드를 파라미터로 받는 생성자
//@Data : @Getter, @Setter, @RequiredArgsConstructor, @EqualsAndHashCode, @ToString 포함

@Entity
@Table(name = "EMPLOYEES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpDTO {
    @Id
    @Column(name = "emp_id")
    private String empId;
    
    @Column(name = "emp_name")
    private String empName;
    
    @Column(name = "dep_id")
    private String depId;
    
    @Column(name = "job_id")
    private String jobId;
    
    @Column(name = "emp_email")
    private String empEmail;
    
    @Column(name = "emp_phone")
    private String empPhone;
    
    @Column(name = "emp_home")
    private String empHome;
    
    @Temporal(TemporalType.DATE)
    @Column(name = "emp_birth")
    private Date empBirth;
    
    @Column(name = "salary")
    private BigDecimal salary;
    
    @Column(name = "annual_salary")
    private BigDecimal annualSalary;
    
    @Column(name = "net_annual_salary")
    private BigDecimal netAnnualSalary;
    
    @Temporal(TemporalType.DATE)
    @Column(name = "hire_date")
    private Date hireDate;
    
    @Temporal(TemporalType.DATE)
    @Column(name = "termination_date")
    private Date terminationDate;

}