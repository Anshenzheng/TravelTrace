import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getCurrentUserProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>('/api/users/me');
  }

  getUserProfile(userId: number): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`/api/users/${userId}`);
  }

  updateProfile(profile: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>('/api/users/me', profile);
  }
}
