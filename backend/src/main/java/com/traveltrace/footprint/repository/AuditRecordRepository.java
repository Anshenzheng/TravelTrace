package com.traveltrace.footprint.repository;

import com.traveltrace.footprint.entity.AuditRecord;
import com.traveltrace.footprint.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditRecordRepository extends JpaRepository<AuditRecord, Long> {

    List<AuditRecord> findByPostOrderByCreatedAtDesc(Post post);
}
