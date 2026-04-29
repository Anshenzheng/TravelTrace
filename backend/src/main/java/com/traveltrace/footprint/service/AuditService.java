package com.traveltrace.footprint.service;

import com.traveltrace.footprint.dto.AuditRequest;
import com.traveltrace.footprint.dto.PostDTO;
import com.traveltrace.footprint.entity.*;
import com.traveltrace.footprint.repository.AuditRecordRepository;
import com.traveltrace.footprint.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final PostRepository postRepository;
    private final AuditRecordRepository auditRecordRepository;
    private final AuthService authService;

    public Page<PostDTO> getPendingPosts(Pageable pageable) {
        User admin = authService.getCurrentUser();
        if (admin == null || !admin.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("无权限");
        }

        Page<Post> posts = postRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(PostStatus.PENDING), pageable
        );
        return posts.map(post -> convertToDTO(post, admin));
    }

    @Transactional
    public PostDTO auditPost(AuditRequest request) {
        User admin = authService.getCurrentUser();
        if (admin == null || !admin.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("无权限");
        }

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        if (post.getStatus() != PostStatus.PENDING) {
            throw new RuntimeException("该游记已审核");
        }

        if (Boolean.TRUE.equals(request.getApproved())) {
            post.setStatus(PostStatus.APPROVED);
        } else {
            post.setStatus(PostStatus.REJECTED);
            post.setRejectReason(request.getReason());
        }

        post = postRepository.save(post);

        AuditRecord record = AuditRecord.builder()
                .post(post)
                .admin(admin)
                .action(Boolean.TRUE.equals(request.getApproved()) ? AuditAction.APPROVE : AuditAction.REJECT)
                .reason(request.getReason())
                .build();
        auditRecordRepository.save(record);

        return convertToDTO(post, admin);
    }

    private PostDTO convertToDTO(Post post, User currentUser) {
        List<String> imageUrls = post.getImages().stream()
                .map(PostImage::getImageUrl)
                .toList();

        return PostDTO.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .userNickname(post.getUser().getNickname())
                .userAvatar(post.getUser().getAvatar())
                .cityId(post.getCity() != null ? post.getCity().getId() : null)
                .cityName(post.getCity() != null ? post.getCity().getName() : null)
                .title(post.getTitle())
                .content(post.getContent())
                .coverImage(post.getCoverImage())
                .images(imageUrls)
                .status(post.getStatus())
                .rejectReason(post.getRejectReason())
                .views(post.getViews())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .isLiked(false)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
