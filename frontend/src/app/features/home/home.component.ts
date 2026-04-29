import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PostService } from '../../../core/services/post.service';
import { CityService } from '../../../core/services/city.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../core/models/post.model';
import { City } from '../../../core/models/city.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <mat-icon>explore</mat-icon>
            足记
          </h1>
          <p class="hero-subtitle">记录每一次旅行，留下美好的回忆</p>
          <p class="hero-description">
            标记你去过和想去的城市，生成专属足迹地图，<br>
            分享你的旅行故事，发现更多精彩目的地。
          </p>
          <div class="hero-actions" *ngIf="!authService.isLoggedIn(); else loggedInActions">
            <button mat-raised-button color="primary" routerLink="/register">
              <mat-icon>person_add</mat-icon>
              立即开始
            </button>
            <button mat-stroked-button color="primary" routerLink="/posts">
              <mat-icon>article</mat-icon>
              浏览游记
            </button>
          </div>
          <ng-template #loggedInActions>
            <div class="hero-actions">
              <button mat-raised-button color="primary" routerLink="/map">
                <mat-icon>map</mat-icon>
                我的足迹
              </button>
              <button mat-raised-button color="accent" routerLink="/posts/create">
                <mat-icon>add_circle</mat-icon>
                发布游记
              </button>
            </div>
          </ng-template>
        </div>
        <div class="hero-image">
          <mat-icon>public</mat-icon>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section page-container">
      <h2 class="section-title">
        <mat-icon>star</mat-icon>
        主要功能
      </h2>
      <div class="features-grid">
        <mat-card class="feature-card">
          <div class="feature-icon map-icon">
            <mat-icon>map</mat-icon>
          </div>
          <h3>足迹地图</h3>
          <p>标记你去过的城市，系统自动生成精美的足迹地图，直观展示你的旅行轨迹。</p>
        </mat-card>

        <mat-card class="feature-card">
          <div class="feature-icon post-icon">
            <mat-icon>article</mat-icon>
          </div>
          <h3>图文游记</h3>
          <p>发布精美的旅行笔记，分享你的所见所闻，与其他旅行者交流心得。</p>
        </mat-card>

        <mat-card class="feature-card">
          <div class="feature-icon share-icon">
            <mat-icon>share</mat-icon>
          </div>
          <h3>一键分享</h3>
          <p>将你的足迹地图保存为图片，一键生成长图分享到社交媒体。</p>
        </mat-card>
      </div>
    </section>

    <!-- Latest Posts Section -->
    <section class="posts-section page-container">
      <div class="section-header">
        <h2 class="section-title">
          <mat-icon>article</mat-icon>
          精选游记
        </h2>
        <button mat-button color="primary" routerLink="/posts">
          查看更多 <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <div class="posts-grid" *ngIf="latestPosts.length > 0; else noPosts">
        <mat-card class="post-card" *ngFor="let post of latestPosts" [routerLink]="['/posts', post.id]">
          <div class="post-image" *ngIf="post.coverImage || post.images?.length">
            <img [src]="post.coverImage || post.images[0]" alt="{{post.title}}">
          </div>
          <div class="post-image-placeholder" *ngIf="!post.coverImage && !post.images?.length">
            <mat-icon>image</mat-icon>
          </div>
          <mat-card-content>
            <h3 class="post-title">{{post.title}}</h3>
            <p class="post-excerpt">{{post.content | slice:0:100}}...</p>
            <div class="post-meta">
              <div class="post-author">
                <mat-icon>person</mat-icon>
                <span>{{post.userNickname || post.username}}</span>
              </div>
              <div class="post-stats">
                <span><mat-icon>visibility</mat-icon> {{post.views}}</span>
                <span><mat-icon>favorite</mat-icon> {{post.likesCount}}</span>
                <span><mat-icon>comment</mat-icon> {{post.commentsCount}}</span>
              </div>
            </div>
            <mat-chip *ngIf="post.cityName" class="city-chip">
              <mat-icon>location_on</mat-icon>
              {{post.cityName}}
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
    </section>

    <!-- Popular Cities Section -->
    <section class="cities-section page-container">
      <div class="section-header">
        <h2 class="section-title">
          <mat-icon>location_city</mat-icon>
          热门城市
        </h2>
      </div>

      <div class="cities-grid" *ngIf="popularCities.length > 0">
        <mat-card class="city-card" *ngFor="let city of popularCities">
          <div class="city-image" *ngIf="city.imageUrl">
            <img [src]="city.imageUrl" alt="{{city.name}}">
          </div>
          <div class="city-image-placeholder" *ngIf="!city.imageUrl">
            <mat-icon>location_city</mat-icon>
          </div>
          <div class="city-info">
            <h3 class="city-name">{{city.name}}</h3>
            <p class="city-location">
              <mat-icon>place</mat-icon>
              {{city.country}} {{city.province || ''}}
            </p>
            <button mat-stroked-button color="primary" *ngIf="authService.isLoggedIn()"
                    (click)="$event.stopPropagation(); showCityDetail(city)">
              <mat-icon>add_location</mat-icon>
              添加到足迹
            </button>
          </div>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      padding: 60px 20px;
      min-height: 500px;
      display: flex;
      align-items: center;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }

    .hero-title {
      display: flex;
      align-items: center;
      font-size: 3.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 20px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .hero-title mat-icon {
      font-size: 3.5rem;
      height: 3.5rem;
      width: 3.5rem;
      margin-right: 15px;
    }

    .hero-subtitle {
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 20px;
      font-weight: 300;
    }

    .hero-description {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.8;
      margin-bottom: 30px;
    }

    .hero-actions {
      display: flex;
      gap: 15px;
    }

    .hero-actions button {
      padding: 12px 28px;
      font-size: 1rem;
      font-weight: 500;
    }

    .hero-image {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hero-image mat-icon {
      font-size: 15rem;
      height: 15rem;
      width: 15rem;
      color: rgba(255, 255, 255, 0.3);
    }

    .features-section {
      padding: 60px 20px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
    }

    .feature-card {
      padding: 30px;
      text-align: center;
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .feature-icon mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      color: white;
    }

    .map-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .post-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .share-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      color: #2d3748;
    }

    .feature-card p {
      color: #718096;
      line-height: 1.7;
    }

    .posts-section, .cities-section {
      padding: 40px 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .post-card {
      cursor: pointer;
      overflow: hidden;
    }

    .post-image {
      height: 200px;
      overflow: hidden;
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
    }

    .post-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: #2d3748;
    }

    .post-excerpt {
      color: #718096;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 15px;
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
    }

    .cities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .city-card {
      overflow: hidden;
    }

    .city-image {
      height: 180px;
      overflow: hidden;
    }

    .city-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .city-card:hover .city-image img {
      transform: scale(1.05);
    }

    .city-image-placeholder {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    }

    .city-image-placeholder mat-icon {
      font-size: 3.5rem;
      height: 3.5rem;
      width: 3.5rem;
      color: #a0aec0;
    }

    .city-info {
      padding: 16px;
    }

    .city-name {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #2d3748;
    }

    .city-location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: #718096;
      margin-bottom: 12px;
    }

    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-title {
        font-size: 2.5rem;
        justify-content: center;
      }

      .hero-title mat-icon {
        font-size: 2.5rem;
        height: 2.5rem;
        width: 2.5rem;
      }

      .hero-actions {
        justify-content: center;
        flex-wrap: wrap;
      }

      .hero-image {
        display: none;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  latestPosts: Post[] = [];
  popularCities: City[] = [];

  constructor(
    private postService: PostService,
    private cityService: CityService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLatestPosts();
    this.loadPopularCities();
  }

  loadLatestPosts(): void {
    this.postService.getApprovedPosts(0, 6).subscribe({
      next: (response) => {
        if (response.success) {
          this.latestPosts = response.data.content;
        }
      },
      error: () => {
        this.latestPosts = [];
      }
    });
  }

  loadPopularCities(): void {
    this.cityService.getAllCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.popularCities = response.data.slice(0, 8);
        }
      },
      error: () => {
        this.popularCities = [];
      }
    });
  }

  showCityDetail(city: City): void {
    console.log('Show city detail:', city);
  }
}
