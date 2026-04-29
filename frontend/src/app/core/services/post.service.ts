import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';
import { Post, CreatePostRequest, Comment, CreateCommentRequest, AuditRequest } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  getApprovedPosts(page: number = 0, size: number = 10): Observable<ApiResponse<{ content: Post[], totalElements: number }>> {
    return this.http.get<ApiResponse<{ content: Post[], totalElements: number }>>('/api/posts', {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getMyPosts(page: number = 0, size: number = 10): Observable<ApiResponse<{ content: Post[], totalElements: number }>> {
    return this.http.get<ApiResponse<{ content: Post[], totalElements: number }>>('/api/posts/my', {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getPostsByCity(cityId: number, page: number = 0, size: number = 10): Observable<ApiResponse<{ content: Post[], totalElements: number }>> {
    return this.http.get<ApiResponse<{ content: Post[], totalElements: number }>>(`/api/posts/city/${cityId}`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getPostById(postId: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`/api/posts/${postId}`);
  }

  createPost(request: CreatePostRequest): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>('/api/posts', request);
  }

  updatePost(postId: number, request: CreatePostRequest): Observable<ApiResponse<Post>> {
    return this.http.put<ApiResponse<Post>>(`/api/posts/${postId}`, request);
  }

  deletePost(postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/posts/${postId}`);
  }

  toggleLike(postId: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`/api/likes/toggle/${postId}`, {});
  }

  checkLike(postId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`/api/likes/check/${postId}`);
  }

  getCommentsByPost(postId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`/api/comments/post/${postId}`);
  }

  createComment(request: CreateCommentRequest): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>('/api/comments', request);
  }

  deleteComment(commentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/comments/${commentId}`);
  }

  getPendingPosts(page: number = 0, size: number = 10): Observable<ApiResponse<{ content: Post[], totalElements: number }>> {
    return this.http.get<ApiResponse<{ content: Post[], totalElements: number }>>('/api/admin/posts/pending', {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  auditPost(request: AuditRequest): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>('/api/admin/audit', request);
  }
}
