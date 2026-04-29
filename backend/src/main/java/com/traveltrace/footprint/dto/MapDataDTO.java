package com.traveltrace.footprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapDataDTO {

    private List<MapCity> visitedCities;
    private List<MapCity> wantToVisitCities;
    private Stats stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MapCity {
        private Long id;
        private String name;
        private String country;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String imageUrl;
        private Integer rating;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stats {
        private Long visitedCount;
        private Long wantToVisitCount;
        private Long countriesCount;
    }
}
