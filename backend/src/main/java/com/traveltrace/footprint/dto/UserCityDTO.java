package com.traveltrace.footprint.dto;

import com.traveltrace.footprint.entity.CityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCityDTO {

    private Long id;
    private Long userId;
    private Long cityId;
    private String cityName;
    private String cityNameEn;
    private String country;
    private String province;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String cityDescription;
    private String cityImageUrl;
    private CityStatus status;
    private LocalDate visitDate;
    private Integer rating;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
