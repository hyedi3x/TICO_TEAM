package com.boot.tico.mainBanner.repository;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.boot.tico.mainBanner.dto.MainBannerDTO;

public interface MainBannerRepository extends JpaRepository<MainBannerDTO, Integer> {

	@Modifying
	@Query(value = "UPDATE main_banner_tb SET is_delete = :status WHERE banner_id = :bannerId", nativeQuery = true)
	void updateIsActive(@Param("bannerId") int bannerId, @Param("status") String status);
	
    Optional<MainBannerDTO> findByBannerTitle(String bannerTitle); // 필요시

    @Query("SELECT MAX(b.bannerId) FROM MainBannerDTO b")
    Optional<Integer> findMaxBannerId();

    List<MainBannerDTO> findAllByOrderByDisplayOrderAsc();
}