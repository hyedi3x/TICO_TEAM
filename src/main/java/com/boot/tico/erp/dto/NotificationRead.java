package com.boot.tico.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;

//1. 엔티티 - NotificationRead.java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@IdClass(NotificationReadId.class)
@Table(name = "notification_read")
public class NotificationRead {

    @Id
    @Column(name = "notification_id")
    private Long notificationId;

    @Id
    @Column(name = "emp_id")
    private String empId;

    @Column(name = "read_at")
    private LocalDateTime readAt = LocalDateTime.now();
}
