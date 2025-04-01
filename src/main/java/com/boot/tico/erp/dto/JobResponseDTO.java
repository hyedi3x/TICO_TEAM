package com.boot.tico.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobResponseDTO {
    private String jobId;
    private String jobName;
    private String depId;

    // 매개변수 생성자 (JobDTO 엔티티 객체로부터 JobResponseDTO를 변환할 때 사용)
    public JobResponseDTO(JobDTO job) {
        this.jobId = job.getJobId();
        this.jobName = job.getJobName();
        this.depId = job.getDepId() != null ? job.getDepId().getDepId() : null;  // depId를 꺼낼 때 한 번 더 .getDepId()를 호출
    }
}
