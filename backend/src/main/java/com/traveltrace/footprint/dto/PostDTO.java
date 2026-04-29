package com.traveltrace.footprint.dto;

import com.traveltrace.footprint.entity.PostStatus;
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
public class PostDTO {

    private Long id;
    private Long userId;
    private String username;
    private String userNickname;
    private String userAvatar;
    private Long cityId;
    private String cityName;
    private String title;
    private String content;
    private String coverImage;
    private List<String> images;
    private PostStatus status;
    private String rejectReason;
    private Integer views;
    private Integer likesCount;
    private Integer commentsCount;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
