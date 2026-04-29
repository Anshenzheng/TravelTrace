package com.traveltrace.footprint.service;

import com.traveltrace.footprint.entity.Like;
import com.traveltrace.footprint.entity.Post;
import com.traveltrace.footprint.entity.User;
import com.traveltrace.footprint.repository.LikeRepository;
import com.traveltrace.footprint.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final AuthService authService;

    @Transactional
    public boolean toggleLike(Long postId) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        if (likeRepository.existsByUserAndPost(user, post)) {
            likeRepository.deleteByUserAndPost(user, post);
            postRepository.decrementLikesCount(postId);
            return false;
        } else {
            Like like = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(like);
            postRepository.incrementLikesCount(postId);
            return true;
        }
    }

    public boolean isLiked(Long postId) {
        User user = authService.getCurrentUser();
        if (user == null) {
            return false;
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("游记不存在"));

        return likeRepository.existsByUserAndPost(user, post);
    }
}
