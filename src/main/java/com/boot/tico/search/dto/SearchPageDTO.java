package com.boot.tico.search.dto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "page_tb")
public class SearchPageDTO {

	@Id
    @Column(name = "page_id")
    private int pageId;

    @Column(name = "page_name")
    private String pageName;

    @Column(name = "page_path")
    private String pagePath;

    @Column(name = "require_login")
    private String requireLogin;
}
