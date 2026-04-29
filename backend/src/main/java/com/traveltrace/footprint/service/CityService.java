package com.traveltrace.footprint.service;

import com.traveltrace.footprint.dto.AddCityRequest;
import com.traveltrace.footprint.dto.MapDataDTO;
import com.traveltrace.footprint.dto.UserCityDTO;
import com.traveltrace.footprint.entity.City;
import com.traveltrace.footprint.entity.CityStatus;
import com.traveltrace.footprint.entity.User;
import com.traveltrace.footprint.entity.UserCity;
import com.traveltrace.footprint.repository.CityRepository;
import com.traveltrace.footprint.repository.UserCityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;
    private final UserCityRepository userCityRepository;
    private final AuthService authService;

    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    public City getCityById(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("城市不存在"));
    }

    public List<City> searchCities(String keyword) {
        return cityRepository.searchByName(keyword);
    }

    public List<String> getAllCountries() {
        return cityRepository.findAllCountries();
    }

    public List<String> getProvincesByCountry(String country) {
        return cityRepository.findProvincesByCountry(country);
    }

    @Transactional
    public UserCityDTO addCityToUser(AddCityRequest request) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new RuntimeException("城市不存在"));

        if (userCityRepository.existsByUserAndCityId(user, city.getId())) {
            UserCity existing = userCityRepository.findByUserAndCityId(user, city.getId())
                    .orElseThrow();
            existing.setStatus(request.getStatus());
            if (request.getVisitDate() != null) {
                existing.setVisitDate(request.getVisitDate());
            }
            if (request.getRating() != null) {
                existing.setRating(request.getRating());
            }
            if (request.getNotes() != null) {
                existing.setNotes(request.getNotes());
            }
            existing = userCityRepository.save(existing);
            return convertToDTO(existing);
        }

        UserCity userCity = UserCity.builder()
                .user(user)
                .city(city)
                .status(request.getStatus())
                .visitDate(request.getVisitDate())
                .rating(request.getRating() != null ? request.getRating() : 0)
                .notes(request.getNotes())
                .build();

        userCity = userCityRepository.save(userCity);
        return convertToDTO(userCity);
    }

    @Transactional
    public void removeCityFromUser(Long cityId) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        UserCity userCity = userCityRepository.findByUserAndCityId(user, cityId)
                .orElseThrow(() -> new RuntimeException("未找到该城市记录"));

        userCityRepository.delete(userCity);
    }

    public List<UserCityDTO> getUserCities(CityStatus status) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        List<UserCity> userCities;
        if (status != null) {
            userCities = userCityRepository.findByUserAndStatus(user, status);
        } else {
            userCities = userCityRepository.findAllWithCityByUser(user);
        }

        return userCities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MapDataDTO getUserMapData() {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        List<UserCity> visited = userCityRepository.findByUserAndStatus(user, CityStatus.VISITED);
        List<UserCity> wantToVisit = userCityRepository.findByUserAndStatus(user, CityStatus.WANT_TO_VISIT);

        List<MapDataDTO.MapCity> visitedCities = visited.stream()
                .map(this::convertToMapCity)
                .collect(Collectors.toList());

        List<MapDataDTO.MapCity> wantToVisitCities = wantToVisit.stream()
                .map(this::convertToMapCity)
                .collect(Collectors.toList());

        List<String> visitedCountries = userCityRepository.findDistinctCountriesByUserAndStatus(
                user, CityStatus.VISITED
        );

        long visitedCount = userCityRepository.countByUserAndStatus(user, CityStatus.VISITED);
        long wantToVisitCount = userCityRepository.countByUserAndStatus(user, CityStatus.WANT_TO_VISIT);

        return MapDataDTO.builder()
                .visitedCities(visitedCities)
                .wantToVisitCities(wantToVisitCities)
                .stats(MapDataDTO.Stats.builder()
                        .visitedCount(visitedCount)
                        .wantToVisitCount(wantToVisitCount)
                        .countriesCount((long) visitedCountries.size())
                        .build())
                .build();
    }

    private MapDataDTO.MapCity convertToMapCity(UserCity userCity) {
        City city = userCity.getCity();
        return MapDataDTO.MapCity.builder()
                .id(city.getId())
                .name(city.getName())
                .country(city.getCountry())
                .latitude(city.getLatitude())
                .longitude(city.getLongitude())
                .imageUrl(city.getImageUrl())
                .rating(userCity.getRating())
                .notes(userCity.getNotes())
                .build();
    }

    private UserCityDTO convertToDTO(UserCity userCity) {
        City city = userCity.getCity();
        return UserCityDTO.builder()
                .id(userCity.getId())
                .userId(userCity.getUser().getId())
                .cityId(city.getId())
                .cityName(city.getName())
                .cityNameEn(city.getNameEn())
                .country(city.getCountry())
                .province(city.getProvince())
                .latitude(city.getLatitude())
                .longitude(city.getLongitude())
                .cityDescription(city.getDescription())
                .cityImageUrl(city.getImageUrl())
                .status(userCity.getStatus())
                .visitDate(userCity.getVisitDate())
                .rating(userCity.getRating())
                .notes(userCity.getNotes())
                .createdAt(userCity.getCreatedAt())
                .updatedAt(userCity.getUpdatedAt())
                .build();
    }
}
