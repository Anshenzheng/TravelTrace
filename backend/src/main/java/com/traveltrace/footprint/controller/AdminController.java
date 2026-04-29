package com.traveltrace.footprint.controller;

import com.traveltrace.footprint.dto.ApiResponse;
import com.traveltrace.footprint.dto.AuditRequest;
import com.traveltrace.footprint.dto.PostDTO;
import com.traveltrace.footprint.service.AuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuditService auditService;

    @GetMapping("/posts/pending")
    public ApiResponse<Page<PostDTO>> getPendingPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PostDTO> posts = auditService.getPendingPosts(pageable);
            return ApiResponse.success(posts);
        } catch (Exception e) {
            return ApiResponse.error("获取待审核列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/audit")
    public ApiResponse<PostDTO> auditPost(@Valid @RequestBody AuditRequest request) {
        try {
            PostDTO post = auditService.auditPost(request);
            String message = Boolean.TRUE.equals(request.getApproved()) ? "审核通过" : "已拒绝";
            return ApiResponse.success(message, post);
        } catch (Exception e) {
            return ApiResponse.error("审核失败: " + e.getMessage());
        }
    }
}
