package com.traveltrace.footprint.controller;

import com.traveltrace.footprint.dto.ApiResponse;
import com.traveltrace.footprint.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/toggle/{postId}")
    public ApiResponse<Boolean> toggleLike(@PathVariable Long postId) {
        try {
            boolean isLiked = likeService.toggleLike(postId);
            return ApiResponse.success(isLiked ? "点赞成功" : "取消点赞成功", isLiked);
        } catch (Exception e) {
            return ApiResponse.error("操作失败: " + e.getMessage());
        }
    }

    @GetMapping("/check/{postId}")
    public ApiResponse<Boolean> checkLike(@PathVariable Long postId) {
        try {
            boolean isLiked = likeService.isLiked(postId);
            return ApiResponse.success(isLiked);
        } catch (Exception e) {
            return ApiResponse.error("查询失败: " + e.getMessage());
        }
    }
}
