import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PostService } from '../../../core/services/post.service';
import { CityService } from '../../../core/services/city.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, PostStatus } from '../../../core/models/post.model';
import { City } from '../../../core/models/city.model';
import { ApiResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-title">
          <mat-icon>article</mat-icon>
          <h1>游记</h1>
        </div>
        <button mat-raised-button color="primary" routerLink="/posts/create" *ngIf="authService.isLoggedIn()">
          <mat-icon>add_circle</mat-icon>
          发布游记
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>按城市筛选</mat-label>
            <mat-select [value]="selectedCityId" (selectionChange)="onCityChange($event.value)">
              <mat-option [value]="null">全部城市</mat-option>
              <mat-option *ngFor="let city of cities" [value]="city.id">
                {{ city.name }} ({{ city.country }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Posts Grid -->
      <div class="posts-container" *ngIf="!isLoading; else loading">
        <div class="posts-grid" *ngIf="posts.length > 0; else noPosts">
          <mat-card class="post-card" *ngFor="let post of posts" [routerLink]="['/posts', post.id]">
            <div class="post-image" *ngIf="post.coverImage || post.images?.length">
              <img [src]="post.coverImage || post.images[0]" alt="{{post.title}}">
              <div class="post-overlay">
                <mat-chip class="status-chip" [class.pending]="post.status === PostStatus.PENDING"
                           [class.rejected]="post.status === PostStatus.REJECTED"
                           [class.draft]="post.status === PostStatus.DRAFT">
                  {{ getStatusText(post.status) }}
                </mat-chip>
              </div>
            </div>
            <div class="post-image-placeholder" *ngIf="!post.coverImage && !post.images?.length">
              <mat-icon>image</mat-icon>
            </div>
            <mat-card-content>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">{{ post.content | slice:0:120 }}...</p>
              <div class="post-meta">
                <div class="post-author">
                  <mat-icon>person</mat-icon>
                  <span>{{ post.userNickname || post.username }}</span>
                </div>
                <div class="post-stats">
                  <span><mat-icon>visibility</mat-icon> {{ post.views }}</span>
                  <span><mat-icon>favorite</mat-icon> {{ post.likesCount }}</span>
                  <span><mat-icon>comment</mat-icon> {{ post.commentsCount }}</span>
                </div>
              </div>
              <mat-chip *ngIf="post.cityName" class="city-chip">
                <mat-icon>location_on</mat-icon>
                {{ post.cityName }}
              </mat-chip>
            </mat-card-content>
          </mat-card>
        </div>

        <ng-template #noPosts>
          <div class="empty-state">
            <mat-icon>article</mat-icon>
            <h3>暂无游记</h3>
            <p>快来分享你的第一篇旅行故事吧！</p>
            <button mat-raised-button color="primary" routerLink="/posts/create" *ngIf="authService.isLoggedIn()">
              <mat-icon>add_circle</mat-icon>
              发布游记
            </button>
          </div>
        </ng-template>

        <!-- Pagination -->
        <mat-paginator [length]="totalElements"
                       [pageSize]="pageSize"
                       [pageSizeOptions]="[6, 12, 24]"
                       (page)="onPageChange($event)"
                       showFirstLastButtons>
        </mat-paginator>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>加载中...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      color: #667eea;
    }

    .header-title h1 {
      font-size: 2rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .filter-card {
      margin-bottom: 30px;
      padding: 20px;
    }

    .filters {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .filter-field {
      min-width: 250px;
    }

    .posts-container {
      min-height: 400px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #718096;
    }

    .loading-container mat-progress-spinner {
      margin-bottom: 20px;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 30px;
    }

    .post-card {
      cursor: pointer;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .post-image {
      height: 200px;
      overflow: hidden;
      position: relative;
    }

    .post-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .post-card:hover .post-image img {
      transform: scale(1.05);
    }

    .post-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
    }

    .status-chip {
      background: rgba(0, 0, 0, 0.6) !important;
      color: white !important;
      font-size: 0.75rem;
    }

    .status-chip.pending {
      background: rgba(237, 137, 54, 0.9) !important;
    }

    .status-chip.rejected {
      background: rgba(245, 101, 101, 0.9) !important;
    }

    .status-chip.draft {
      background: rgba(160, 174, 192, 0.9) !important;
    }

    .post-image-placeholder {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    }

    .post-image-placeholder mat-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      color: #a0aec0;
    }

    .post-card mat-card-content {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .post-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #2d3748;
      line-height: 1.4;
    }

    .post-excerpt {
      color: #718096;
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 15px 0;
      flex: 1;
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 0.85rem;
      color: #a0aec0;
    }

    .post-author, .post-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .post-stats {
      display: flex;
      gap: 15px;
    }

    .city-chip {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 0.8rem;
      align-self: flex-start;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #718096;
    }

    .empty-state mat-icon {
      font-size: 5rem;
      height: 5rem;
      width: 5rem;
      margin-bottom: 20px;
      opacity: 0.3;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    mat-paginator {
      background: transparent;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .posts-grid {
        grid-template-columns: 1fr;
      }

      .filter-field {
        width: 100%;
        min-width: auto;
      }
    }
  `]
})
export class PostListComponent implements OnInit {
  PostStatus = PostStatus;

  posts: Post[] = [];
  cities: City[] = [];
  selectedCityId: number | null = null;
  isLoading = false;
  totalElements = 0;
  pageSize = 12;
  currentPage = 0;

  constructor(
    private postService: PostService,
    private cityService: CityService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadPosts();
  }

  loadCities(): void {
    this.cityService.getAllCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.data;
        }
      },
      error: () => {
        this.cities = [];
      }
    });
  }

  loadPosts(): void {
    this.isLoading = true;

    const loadFn = this.selectedCityId
      ? () => this.postService.getPostsByCity(this.selectedCityId!, this.currentPage, this.pageSize)
      : () => this.postService.getApprovedPosts(this.currentPage, this.pageSize);

    loadFn().subscribe({
      next: (response) => {
        if (response.success) {
          this.posts = response.data.content;
          this.totalElements = response.data.totalElements;
        }
        this.isLoading = false;
      },
      error: () => {
        this.posts = [];
        this.isLoading = false;
      }
    });
  }

  onCityChange(cityId: number | null): void {
    this.selectedCityId = cityId;
    this.currentPage = 0;
    this.loadPosts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }

  getStatusText(status: PostStatus): string {
    const statusMap: Record<PostStatus, string> = {
      [PostStatus.PENDING]: '审核中',
      [PostStatus.APPROVED]: '已发布',
      [PostStatus.REJECTED]: '已拒绝',
      [PostStatus.DRAFT]: '草稿'
    };
    return statusMap[status] || status;
  }
}
