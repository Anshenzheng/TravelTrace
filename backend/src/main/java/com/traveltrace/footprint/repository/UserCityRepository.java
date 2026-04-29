package com.traveltrace.footprint.repository;

import com.traveltrace.footprint.entity.CityStatus;
import com.traveltrace.footprint.entity.User;
import com.traveltrace.footprint.entity.UserCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCityRepository extends JpaRepository<UserCity, Long> {

    List<UserCity> findByUser(User user);

    List<UserCity> findByUserAndStatus(User user, CityStatus status);

    Optional<UserCity> findByUserAndCityId(User user, Long cityId);

    boolean existsByUserAndCityId(User user, Long cityId);

    boolean existsByUserAndCityIdAndStatus(User user, Long cityId, CityStatus status);

    @Query("SELECT COUNT(uc) FROM UserCity uc WHERE uc.user = ?1 AND uc.status = ?2")
    long countByUserAndStatus(User user, CityStatus status);

    @Query("SELECT DISTINCT uc.city.country FROM UserCity uc WHERE uc.user = ?1 AND uc.status = ?2")
    List<String> findDistinctCountriesByUserAndStatus(User user, CityStatus status);

    @Query("SELECT uc FROM UserCity uc JOIN FETCH uc.city WHERE uc.user = ?1 ORDER BY uc.updatedAt DESC")
    List<UserCity> findAllWithCityByUser(User user);
}
