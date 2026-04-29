package com.traveltrace.footprint.controller;

import com.traveltrace.footprint.dto.*;
import com.traveltrace.footprint.entity.City;
import com.traveltrace.footprint.entity.CityStatus;
import com.traveltrace.footprint.service.CityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    @GetMapping
    public ApiResponse<List<City>> getAllCities() {
        try {
            List<City> cities = cityService.getAllCities();
            return ApiResponse.success(cities);
        } catch (Exception e) {
            return ApiResponse.error("获取城市列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<City> getCityById(@PathVariable Long id) {
        try {
            City city = cityService.getCityById(id);
            return ApiResponse.success(city);
        } catch (Exception e) {
            return ApiResponse.error("获取城市信息失败: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ApiResponse<List<City>> searchCities(@RequestParam String keyword) {
        try {
            List<City> cities = cityService.searchCities(keyword);
            return ApiResponse.success(cities);
        } catch (Exception e) {
            return ApiResponse.error("搜索城市失败: " + e.getMessage());
        }
    }

    @GetMapping("/countries")
    public ApiResponse<List<String>> getAllCountries() {
        try {
            List<String> countries = cityService.getAllCountries();
            return ApiResponse.success(countries);
        } catch (Exception e) {
            return ApiResponse.error("获取国家列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/countries/{country}/provinces")
    public ApiResponse<List<String>> getProvincesByCountry(@PathVariable String country) {
        try {
            List<String> provinces = cityService.getProvincesByCountry(country);
            return ApiResponse.success(provinces);
        } catch (Exception e) {
            return ApiResponse.error("获取省份列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/user")
    public ApiResponse<UserCityDTO> addCityToUser(@Valid @RequestBody AddCityRequest request) {
        try {
            UserCityDTO result = cityService.addCityToUser(request);
            return ApiResponse.success("添加成功", result);
        } catch (Exception e) {
            return ApiResponse.error("添加失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/user/{cityId}")
    public ApiResponse<Void> removeCityFromUser(@PathVariable Long cityId) {
        try {
            cityService.removeCityFromUser(cityId);
            return ApiResponse.success("移除成功", null);
        } catch (Exception e) {
            return ApiResponse.error("移除失败: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ApiResponse<List<UserCityDTO>> getUserCities(
            @RequestParam(required = false) CityStatus status) {
        try {
            List<UserCityDTO> cities = cityService.getUserCities(status);
            return ApiResponse.success(cities);
        } catch (Exception e) {
            return ApiResponse.error("获取用户城市列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/user/map")
    public ApiResponse<MapDataDTO> getUserMapData() {
        try {
            MapDataDTO mapData = cityService.getUserMapData();
            return ApiResponse.success(mapData);
        } catch (Exception e) {
            return ApiResponse.error("获取地图数据失败: " + e.getMessage());
        }
    }
}
