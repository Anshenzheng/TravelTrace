package com.traveltrace.footprint.controller;

import com.traveltrace.footprint.dto.ApiResponse;
import com.traveltrace.footprint.dto.CreatePostRequest;
import com.traveltrace.footprint.dto.PostDTO;
import com.traveltrace.footprint.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ApiResponse<Page<PostDTO>> getApprovedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PostDTO> posts = postService.getApprovedPosts(pageable);
            return ApiResponse.success(posts);
        } catch (Exception e) {
            return ApiResponse.error("获取游记列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public ApiResponse<Page<PostDTO>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PostDTO> posts = postService.getMyPosts(pageable);
            return ApiResponse.success(posts);
        } catch (Exception e) {
            return ApiResponse.error("获取我的游记失败: " + e.getMessage());
        }
    }

    @GetMapping("/city/{cityId}")
    public ApiResponse<Page<PostDTO>> getPostsByCity(
            @PathVariable Long cityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PostDTO> posts = postService.getPostsByCity(cityId, pageable);
            return ApiResponse.success(posts);
        } catch (Exception e) {
            return ApiResponse.error("获取城市游记失败: " + e.getMessage());
        }
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostDTO> getPostById(@PathVariable Long postId) {
        try {
            PostDTO post = postService.getPostById(postId);
            return ApiResponse.success(post);
        } catch (Exception e) {
            return ApiResponse.error("获取游记失败: " + e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<PostDTO> createPost(@Valid @RequestBody CreatePostRequest request) {
        try {
            PostDTO post = postService.createPost(request);
            return ApiResponse.success("发布成功", post);
        } catch (Exception e) {
            return ApiResponse.error("发布失败: " + e.getMessage());
        }
    }

    @PutMapping("/{postId}")
    public ApiResponse<PostDTO> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody CreatePostRequest request) {
        try {
            PostDTO post = postService.updatePost(postId, request);
            return ApiResponse.success("更新成功", post);
        } catch (Exception e) {
            return ApiResponse.error("更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        try {
            postService.deletePost(postId);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }
}
