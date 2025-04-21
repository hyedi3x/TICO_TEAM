package com.boot.tico.mainBanner.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.boot.tico.mainBanner.dto.MainBannerDTO;
import com.boot.tico.mainBanner.repository.MainBannerRepository;

@Service
public class MainBannerService {

    @Autowired
    private MainBannerRepository bannerRepository;

    public List<MainBannerDTO> getAllBanners() {
        // 정렬 기준: displayOrder 오름차순
        return bannerRepository.findAll(Sort.by("displayOrder"));
    }

    public void saveOrUpdateBanner(MainBannerDTO dto) {
        MainBannerDTO banner;

        if (dto.getBannerId() == 0) {
            Optional<Integer> maxId = bannerRepository.findMaxBannerId();
            int newId = maxId.orElse(0) + 1;
            banner = new MainBannerDTO();
            banner.setBannerId(newId);
        } else {
            banner = bannerRepository.findById(dto.getBannerId()).orElse(new MainBannerDTO());
            banner.setBannerId(dto.getBannerId());
        }

        banner.setEmpId(dto.getEmpId());
        banner.setBannerImage(dto.getBannerImage());
        banner.setBannerLink(dto.getBannerLink());
        banner.setBannerTitle(dto.getBannerTitle());
        banner.setDisplayOrder(dto.getDisplayOrder());

        bannerRepository.save(banner);
    }

    public void softDelete(int banner_id) {
        MainBannerDTO banner = bannerRepository.findById(banner_id).orElseThrow();
        banner.setIsDelete("Y");
        bannerRepository.save(banner);
    }

    public void recoverBanner(int banner_id) {
        MainBannerDTO banner = bannerRepository.findById(banner_id).orElseThrow();
        banner.setIsDelete("N");
        bannerRepository.save(banner);
    }

    public void deleteBanner(int id) {
        bannerRepository.deleteById(id);
    }
}