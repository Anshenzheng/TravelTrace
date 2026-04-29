package com.traveltrace.footprint.dto;

import com.traveltrace.footprint.entity.CityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddCityRequest {

    @NotNull(message = "城市ID不能为空")
    private Long cityId;

    @NotNull(message = "状态不能为空")
    private CityStatus status;

    private LocalDate visitDate;

    private Integer rating;

    private String notes;
}
