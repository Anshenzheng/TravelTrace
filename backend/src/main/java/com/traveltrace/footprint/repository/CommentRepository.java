package com.traveltrace.footprint.repository;

import com.traveltrace.footprint.entity.Comment;
import com.traveltrace.footprint.entity.CommentStatus;
import com.traveltrace.footprint.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostAndParentIsNullAndStatusOrderByCreatedAtDesc(Post post, CommentStatus status);

    List<Comment> findByParentAndStatusOrderByCreatedAtAsc(Comment parent, CommentStatus status);

    long countByPostAndStatus(Post post, CommentStatus status);
}
