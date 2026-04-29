import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';
import { City, UserCity, AddCityRequest, MapData, CityStatus } from '../models/city.model';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(private http: HttpClient) { }

  getAllCities(): Observable<ApiResponse<City[]>> {
    return this.http.get<ApiResponse<City[]>>('/api/cities');
  }

  getCityById(id: number): Observable<ApiResponse<City>> {
    return this.http.get<ApiResponse<City>>(`/api/cities/${id}`);
  }

  searchCities(keyword: string): Observable<ApiResponse<City[]>> {
    return this.http.get<ApiResponse<City[]>>('/api/cities/search', {
      params: { keyword }
    });
  }

  getAllCountries(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>('/api/cities/countries');
  }

  getProvincesByCountry(country: string): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`/api/cities/countries/${country}/provinces`);
  }

  addCityToUser(request: AddCityRequest): Observable<ApiResponse<UserCity>> {
    return this.http.post<ApiResponse<UserCity>>('/api/cities/user', request);
  }

  removeCityFromUser(cityId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/cities/user/${cityId}`);
  }

  getUserCities(status?: CityStatus): Observable<ApiResponse<UserCity[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<UserCity[]>>('/api/cities/user', { params });
  }

  getUserMapData(): Observable<ApiResponse<MapData>> {
    return this.http.get<ApiResponse<MapData>>('/api/cities/user/map');
  }
}
