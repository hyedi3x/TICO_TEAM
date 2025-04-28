package com.boot.tico.purchase.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.tico.purchase.dto.Purchase;

@Repository
public interface PurchaseRepo extends JpaRepository<Purchase, String>{

}
