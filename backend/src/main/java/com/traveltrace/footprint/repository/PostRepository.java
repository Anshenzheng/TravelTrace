package com.traveltrace.footprint.repository;

import com.traveltrace.footprint.entity.Post;
import com.traveltrace.footprint.entity.PostStatus;
import com.traveltrace.footprint.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);

    Page<Post> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Page<Post> findByCityIdAndStatusOrderByCreatedAtDesc(Long cityId, PostStatus status, Pageable pageable);

    Page<Post> findByStatusInOrderByCreatedAtDesc(List<PostStatus> statuses, Pageable pageable);

    Page<Post> findByUserAndStatusInOrderByCreatedAtDesc(User user, List<PostStatus> statuses, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = ?1 AND (p.title LIKE %?2% OR p.content LIKE %?2%)")
    Page<Post> searchByKeyword(PostStatus status, String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.views = p.views + 1 WHERE p.id = ?1")
    void incrementViews(Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.id = ?1")
    void incrementLikesCount(Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount - 1 WHERE p.id = ?1")
    void decrementLikesCount(Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount + 1 WHERE p.id = ?1")
    void incrementCommentsCount(Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount - 1 WHERE p.id = ?1")
    void decrementCommentsCount(Long postId);

    long countByUser(User user);

    long countByStatus(PostStatus status);

    long countByUserAndStatusIn(User user, List<PostStatus> statuses);
}
