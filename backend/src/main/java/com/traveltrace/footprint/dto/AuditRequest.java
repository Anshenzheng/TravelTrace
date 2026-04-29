package com.traveltrace.footprint.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditRequest {

    @NotNull(message = "游记ID不能为空")
    private Long postId;

    private Boolean approved;

    private String reason;
}
