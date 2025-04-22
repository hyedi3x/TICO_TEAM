package com.boot.tico.mainBanner.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.mainBanner.dto.MainBannerDTO;
import com.boot.tico.mainBanner.service.MainBannerService;

@RestController
@RequestMapping("/banner")
public class MainBannerController {

    @Autowired
    private MainBannerService bannerService;

    private final Logger logger = LoggerFactory.getLogger(MainBannerController.class);

    @GetMapping("/list")
    public List<MainBannerDTO> getBanners() {
        logger.info("<<< url => getBanners >>>");
        return bannerService.getAllBanners();
    }
    
    // 저장 시 bannerId 없음 -> 등록
    @PostMapping
    public ResponseEntity<?> createBanner(@RequestBody MainBannerDTO dto) {
        logger.info("<<< url => createBanner >>>");
        bannerService.saveOrUpdateBanner(dto);
        return ResponseEntity.ok().build();
    }
    
    // 저장시 bannerId 있음 -> 수정
    @PutMapping
    public ResponseEntity<?> updateBanner(@RequestBody MainBannerDTO dto) {
        logger.info("<<< url => updateBanner >>>");
        bannerService.saveOrUpdateBanner(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/soft") // 경로 변수를 @PathVariable로 받는다.
    public ResponseEntity<?> softDelete(@PathVariable int id) {
        logger.info("<<< url => softDelete >>> id = {}", id);
        bannerService.softDelete(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/recover")
    public ResponseEntity<?> recoverBanner(@PathVariable int id) {
        logger.info("<<< url => recoverBanner >>> id = {}", id);
        bannerService.recoverBanner(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable int id) {
        logger.info("<<< url => deleteBanner >>> id = {}", id);
        bannerService.deleteBanner(id);
        return ResponseEntity.ok().build();
    }
}
