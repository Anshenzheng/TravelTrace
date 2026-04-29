package com.traveltrace.footprint.repository;

import com.traveltrace.footprint.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {

    Optional<City> findByName(String name);

    List<City> findByCountry(String country);

    List<City> findByProvince(String province);

    @Query("SELECT c FROM City c WHERE c.name LIKE %?1% OR c.nameEn LIKE %?1%")
    List<City> searchByName(String keyword);

    @Query("SELECT DISTINCT c.country FROM City c ORDER BY c.country")
    List<String> findAllCountries();

    @Query("SELECT DISTINCT c.province FROM City c WHERE c.country = ?1 ORDER BY c.province")
    List<String> findProvincesByCountry(String country);
}
