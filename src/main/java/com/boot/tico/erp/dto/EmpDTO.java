package com.boot.tico.erp.dto;

import java.math.BigDecimal;
import java.util.Date;
import javax.persistence.*;

import lombok.Data;

@Entity
@Table(name = "EMPLOYEES")
@Data
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

    @Override
    public String toString() {
        return "EmpDTO{" +
                "empId='" + empId + '\'' +
                ", empName='" + empName + '\'' +
                ", depId='" + depId + '\'' +
                ", jobId='" + jobId + '\'' +
                ", empEmail='" + empEmail + '\'' +
                ", empPhone='" + empPhone + '\'' +
                ", empHome='" + empHome + '\'' +
                ", empBirth=" + empBirth +
                ", salary=" + salary +
                ", annualSalary=" + annualSalary +
                ", netAnnualSalary=" + netAnnualSalary +
                ", hireDate=" + hireDate +
                ", terminationDate=" + terminationDate +
                '}';
    }
}