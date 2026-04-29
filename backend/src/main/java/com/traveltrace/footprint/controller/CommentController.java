package com.traveltrace.footprint.controller;

import com.traveltrace.footprint.dto.ApiResponse;
import com.traveltrace.footprint.dto.CommentDTO;
import com.traveltrace.footprint.dto.CreateCommentRequest;
import com.traveltrace.footprint.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/post/{postId}")
    public ApiResponse<List<CommentDTO>> getCommentsByPost(@PathVariable Long postId) {
        try {
            List<CommentDTO> comments = commentService.getCommentsByPost(postId);
            return ApiResponse.success(comments);
        } catch (Exception e) {
            return ApiResponse.error("获取评论列表失败: " + e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<CommentDTO> createComment(@Valid @RequestBody CreateCommentRequest request) {
        try {
            CommentDTO comment = commentService.createComment(request);
            return ApiResponse.success("评论成功", comment);
        } catch (Exception e) {
            return ApiResponse.error("评论失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        try {
            commentService.deleteComment(commentId);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error("删除失败: " + e.getMessage());
        }
    }
}
