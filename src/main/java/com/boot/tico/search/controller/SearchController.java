package com.boot.tico.search.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.tico.search.service.SearchService;

@RestController
@RequestMapping("/api")
public class SearchController {
	@Autowired
    private SearchService service;

    @GetMapping("/search")
    public ResponseEntity<?> searchAll(@RequestParam String query) {
        Map<String, Object> result = service.searchAll(query);
        return ResponseEntity.ok(result);
    }
}
