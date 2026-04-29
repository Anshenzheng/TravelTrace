package com.traveltrace.footprint.service;

import com.traveltrace.footprint.dto.CommentDTO;
import com.traveltrace.footprint.dto.CreateCommentRequest;
import com.traveltrace.footprint.entity.Comment;
import com.traveltrace.footprint.entity.CommentStatus;
import com.traveltrace.footprint.entity.Post;
import com.traveltrace.footprint.entity.User;
import com.traveltrace.footprint.repository.CommentRepository;
import com.traveltrace.footprint.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final AuthService authService;

    @Transactional
    public CommentDTO createComment(CreateCommentRequest request) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        Comment.CommentBuilder commentBuilder = Comment.builder()
                .user(user)
                .post(post)
                .content(request.getContent())
                .status(CommentStatus.ACTIVE);

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("父评论不存在"));
            commentBuilder.parent(parent);
        }

        Comment comment = commentBuilder.build();
        comment = commentRepository.save(comment);

        postRepository.incrementCommentsCount(post.getId());

        return convertToDTO(comment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权删除此评论");
        }

        comment.setStatus(CommentStatus.DELETED);
        commentRepository.save(comment);

        postRepository.decrementCommentsCount(comment.getPost().getId());
    }

    public List<CommentDTO> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        List<Comment> comments = commentRepository.findByPostAndParentIsNullAndStatusOrderByCreatedAtDesc(
                post, CommentStatus.ACTIVE
        );

        return comments.stream()
                .map(this::convertToDTOWithReplies)
                .collect(Collectors.toList());
    }

    private CommentDTO convertToDTO(Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .nickname(comment.getUser().getNickname())
                .avatar(comment.getUser().getAvatar())
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private CommentDTO convertToDTOWithReplies(Comment comment) {
        CommentDTO dto = convertToDTO(comment);

        List<Comment> replies = commentRepository.findByParentAndStatusOrderByCreatedAtAsc(
                comment, CommentStatus.ACTIVE
        );
        dto.setReplies(replies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));

        return dto;
    }
}
