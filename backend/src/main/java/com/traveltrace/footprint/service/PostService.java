package com.traveltrace.footprint.service;

import com.traveltrace.footprint.dto.CreatePostRequest;
import com.traveltrace.footprint.dto.PostDTO;
import com.traveltrace.footprint.entity.*;
import com.traveltrace.footprint.repository.CityRepository;
import com.traveltrace.footprint.repository.LikeRepository;
import com.traveltrace.footprint.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CityRepository cityRepository;
    private final LikeRepository likeRepository;
    private final AuthService authService;

    @Transactional
    public PostDTO createPost(CreatePostRequest request) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        Post.PostBuilder postBuilder = Post.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .coverImage(request.getCoverImage());

        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new RuntimeException("城市不存在"));
            postBuilder.city(city);
        }

        if (Boolean.TRUE.equals(request.getAsDraft())) {
            postBuilder.status(PostStatus.DRAFT);
        } else {
            postBuilder.status(PostStatus.PENDING);
        }

        Post post = postBuilder.build();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (int i = 0; i < request.getImages().size(); i++) {
                PostImage image = PostImage.builder()
                        .post(post)
                        .imageUrl(request.getImages().get(i))
                        .sortOrder(i)
                        .build();
                post.getImages().add(image);
            }
        }

        post = postRepository.save(post);
        return convertToDTO(post, user);
    }

    @Transactional
    public PostDTO updatePost(Long postId, CreatePostRequest request) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权修改此游记");
        }

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getCoverImage() != null) {
            post.setCoverImage(request.getCoverImage());
        }
        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new RuntimeException("城市不存在"));
            post.setCity(city);
        }

        if (request.getImages() != null) {
            post.getImages().clear();
            for (int i = 0; i < request.getImages().size(); i++) {
                PostImage image = PostImage.builder()
                        .post(post)
                        .imageUrl(request.getImages().get(i))
                        .sortOrder(i)
                        .build();
                post.getImages().add(image);
            }
        }

        post = postRepository.save(post);
        return convertToDTO(post, user);
    }

    @Transactional
    public void deletePost(Long postId) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        if (!post.getUser().getId().equals(user.getId()) && !user.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("无权删除此游记");
        }

        postRepository.delete(post);
    }

    public PostDTO getPostById(Long postId) {
        User user = authService.getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        if (post.getStatus() != PostStatus.APPROVED) {
            if (user == null ||
                    (!post.getUser().getId().equals(user.getId()) && !user.getRole().equals(Role.ADMIN))) {
                throw new RuntimeException("游记不存在或未审核通过");
            }
        }

        postRepository.incrementViews(postId);
        post.setViews(post.getViews() + 1);

        return convertToDTO(post, user);
    }

    public Page<PostDTO> getApprovedPosts(Pageable pageable) {
        User user = authService.getCurrentUser();
        Page<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.APPROVED, pageable);
        return posts.map(post -> convertToDTO(post, user));
    }

    public Page<PostDTO> getPostsByCity(Long cityId, Pageable pageable) {
        User user = authService.getCurrentUser();
        Page<Post> posts = postRepository.findByCityIdAndStatusOrderByCreatedAtDesc(
                cityId, PostStatus.APPROVED, pageable
        );
        return posts.map(post -> convertToDTO(post, user));
    }

    public Page<PostDTO> getMyPosts(Pageable pageable) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        Page<Post> posts = postRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return posts.map(post -> convertToDTO(post, user));
    }

    private PostDTO convertToDTO(Post post, User currentUser) {
        boolean isLiked = false;
        if (currentUser != null) {
            isLiked = likeRepository.existsByUserAndPost(currentUser, post);
        }

        List<String> imageUrls = post.getImages().stream()
                .map(PostImage::getImageUrl)
                .collect(Collectors.toList());

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
                .isLiked(isLiked)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
