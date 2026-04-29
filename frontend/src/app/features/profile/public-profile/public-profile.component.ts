import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../core/services/user.service';
import { CityService } from '../../../core/services/city.service';
import { PostService } from '../../../core/services/post.service';
import { UserProfile } from '../../../core/models/user.model';
import { UserCity, CityStatus } from '../../../core/models/city.model';
import { Post, PostStatus } from '../../../core/models/post.model';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="back-nav">
        <button mat-button routerLink="/posts">
          <mat-icon>arrow_back</mat-icon>
          返回
        </button>
      </div>

      <div *ngIf="!isLoading; else loading">
        <!-- Profile Header -->
        <mat-card class="profile-header-card">
          <div class="profile-header">
            <div class="avatar-section">
              <div class="avatar-large" *ngIf="profile?.avatar">
                <img [src]="profile.avatar" alt="头像">
              </div>
              <div class="avatar-large placeholder" *ngIf="!profile?.avatar">
                <mat-icon>person</mat-icon>
              </div>
            </div>
            <div class="info-section">
              <h1 class="user-name">{{ profile?.nickname || profile?.username }}</h1>
              <p class="user-username">@{{ profile?.username }}</p>
              <p class="user-bio" *ngIf="profile?.bio">{{ profile?.bio }}</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ profile?.visitedCitiesCount || 0 }}</span>
              <span class="stat-label">已到城市</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ profile?.wantToVisitCitiesCount || 0 }}</span>
              <span class="stat-label">想去城市</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ profile?.postsCount || 0 }}</span>
              <span class="stat-label">游记数量</span>
            </div>
          </div>
        </mat-card>

        <!-- Recent Posts -->
        <mat-card class="posts-section-card" *ngIf="posts.length > 0">
          <h2 class="section-title">
            <mat-icon>article</mat-icon>
            TA的游记
          </h2>
          <div class="posts-grid">
            <mat-card class="post-card" *ngFor="let post of posts" [routerLink]="['/posts', post.id]">
              <div class="post-image" *ngIf="post.coverImage || post.images?.length">
                <img [src]="post.coverImage || post.images[0]" alt="{{post.title}}">
              </div>
              <div class="post-image-placeholder" *ngIf="!post.coverImage && !post.images?.length">
                <mat-icon>image</mat-icon>
              </div>
              <mat-card-content>
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-stats">
                  <span><mat-icon>visibility</mat-icon> {{ post.views }}</span>
                  <span><mat-icon>favorite</mat-icon> {{ post.likesCount }}</span>
                  <span><mat-icon>comment</mat-icon> {{ post.commentsCount }}</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-card>

        <div class="empty-state" *ngIf="posts.length === 0">
          <mat-icon>article</mat-icon>
          <h3>暂无公开游记</h3>
        </div>
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .back-nav {
      margin-bottom: 20px;
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

    .profile-header-card {
      margin-bottom: 30px;
      padding: 30px;
    }

    .profile-header {
      display: flex;
      gap: 30px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .avatar-section {
      flex-shrink: 0;
    }

    .avatar-large {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #e2e8f0;
    }

    .avatar-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-large.placeholder {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-large.placeholder mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      color: white;
    }

    .info-section {
      flex: 1;
      min-width: 250px;
    }

    .user-name {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 5px 0;
      color: #2d3748;
    }

    .user-username {
      font-size: 1rem;
      color: #718096;
      margin: 0 0 10px 0;
    }

    .user-bio {
      font-size: 1rem;
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    .stats-row {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 30px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      display: block;
      font-size: 0.9rem;
      color: #718096;
      margin-top: 4px;
    }

    .stat-divider {
      width: 1px;
      background: #e2e8f0;
    }

    .posts-section-card {
      padding: 30px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .section-title mat-icon {
      color: #667eea;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .post-card {
      overflow: hidden;
      cursor: pointer;
    }

    .post-image {
      height: 160px;
      overflow: hidden;
    }

    .post-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .post-image-placeholder {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    }

    .post-image-placeholder mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      color: #a0aec0;
    }

    .post-card mat-card-content {
      padding: 16px;
    }

    .post-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #2d3748;
      line-height: 1.4;
    }

    .post-stats {
      display: flex;
      gap: 15px;
      font-size: 0.85rem;
      color: #a0aec0;
    }

    .post-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
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

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .stats-row {
        flex-wrap: wrap;
        gap: 20px;
      }

      .stat-divider {
        display: none;
      }

      .posts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PublicProfileComponent implements OnInit {
  PostStatus = PostStatus;

  userId: number | null = null;
  profile: UserProfile | null = null;
  posts: Post[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      this.userId = +userId;
      this.loadProfile(+userId);
    }
  }

  loadProfile(userId: number): void {
    this.userService.getUserProfile(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.profile = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
