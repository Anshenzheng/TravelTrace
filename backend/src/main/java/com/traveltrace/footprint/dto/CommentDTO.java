package com.traveltrace.footprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    private Long id;
    private Long userId;
    private String username;
    private String nickname;
    private String avatar;
    private Long postId;
    private Long parentId;
    private String content;
    private List<CommentDTO> replies;
    private LocalDateTime createdAt;
}
