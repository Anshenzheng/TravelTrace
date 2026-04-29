import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../core/services/user.service';
import { CityService } from '../../../core/services/city.service';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile } from '../../../core/models/user.model';
import { UserCity, CityStatus } from '../../../core/models/city.model';
import { Post, PostStatus } from '../../../core/models/post.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
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
              <p class="user-email">
                <mat-icon>email</mat-icon>
                {{ profile?.email }}
              </p>
            </div>
            <div class="actions-section">
              <button mat-raised-button color="primary" (click)="openEditDialog()">
                <mat-icon>edit</mat-icon>
                编辑资料
              </button>
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

        <!-- Tabs -->
        <mat-tab-group>
          <!-- Footprint Tab -->
          <mat-tab label="我的足迹">
            <div class="tab-content">
              <div class="footprint-section" *ngIf="userCities.length > 0; else noFootprint">
                <div class="section-header">
                  <h3>
                    <mat-icon class="visited-icon">check_circle</mat-icon>
                    已到城市
                  </h3>
                  <button mat-button color="primary" routerLink="/map">
                    查看地图 <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
                <div class="city-grid">
                  <mat-card class="city-card" *ngFor="let city of visitedCities">
                    <div class="city-image" *ngIf="city.cityImageUrl">
                      <img [src]="city.cityImageUrl" alt="{{city.cityName}}">
                    </div>
                    <div class="city-image-placeholder" *ngIf="!city.cityImageUrl">
                      <mat-icon>location_city</mat-icon>
                    </div>
                    <div class="city-info">
                      <h4>{{ city.cityName }}</h4>
                      <p>{{ city.country }}</p>
                      <div class="city-rating" *ngIf="city.rating > 0">
                        <mat-icon *ngFor="let i of [1,2,3,4,5]"
                                  [class.filled]="i <= city.rating">star</mat-icon>
                      </div>
                    </div>
                  </mat-card>
                </div>

                <div class="section-header want-to-visit" *ngIf="wantToVisitCities.length > 0">
                  <h3>
                    <mat-icon class="want-icon">star</mat-icon>
                    想去城市
                  </h3>
                </div>
                <div class="city-grid" *ngIf="wantToVisitCities.length > 0">
                  <mat-card class="city-card" *ngFor="let city of wantToVisitCities">
                    <div class="city-image" *ngIf="city.cityImageUrl">
                      <img [src]="city.cityImageUrl" alt="{{city.cityName}}">
                    </div>
                    <div class="city-image-placeholder" *ngIf="!city.cityImageUrl">
                      <mat-icon>location_city</mat-icon>
                    </div>
                    <div class="city-info">
                      <h4>{{ city.cityName }}</h4>
                      <p>{{ city.country }}</p>
                    </div>
                  </mat-card>
                </div>
              </div>

              <ng-template #noFootprint>
                <div class="empty-state">
                  <mat-icon>map</mat-icon>
                  <h3>还没有足迹</h3>
                  <p>开始添加你去过或想去的城市吧！</p>
                  <button mat-raised-button color="primary" routerLink="/cities">
                    <mat-icon>explore</mat-icon>
                    探索城市
                  </button>
                </div>
              </ng-template>
            </div>
          </mat-tab>

          <!-- Posts Tab -->
          <mat-tab label="我的游记">
            <div class="tab-content">
              <div class="posts-section" *ngIf="posts.length > 0; else noPosts">
                <div class="section-header">
                  <h3>游记列表</h3>
                  <button mat-raised-button color="primary" routerLink="/posts/create">
                    <mat-icon>add_circle</mat-icon>
                    写游记
                  </button>
                </div>
                <div class="posts-grid">
                  <mat-card class="post-card" *ngFor="let post of posts" [routerLink]="['/posts', post.id]">
                    <div class="post-image" *ngIf="post.coverImage || post.images?.length">
                      <img [src]="post.coverImage || post.images[0]" alt="{{post.title}}">
                      <mat-chip class="status-chip" [class.pending]="post.status === PostStatus.PENDING"
                                 [class.rejected]="post.status === PostStatus.REJECTED"
                                 [class.draft]="post.status === PostStatus.DRAFT">
                        {{ getStatusText(post.status) }}
                      </mat-chip>
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
              </div>

              <ng-template #noPosts>
                <div class="empty-state">
                  <mat-icon>article</mat-icon>
                  <h3>还没有游记</h3>
                  <p>分享你的旅行故事吧！</p>
                  <button mat-raised-button color="primary" routerLink="/posts/create">
                    <mat-icon>edit</mat-icon>
                    写游记
                  </button>
                </div>
              </ng-template>
            </div>
          </mat-tab>
        </mat-tab-group>
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
      margin: 0 0 10px 0;
    }

    .user-email {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.95rem;
      color: #718096;
      margin: 0;
    }

    .actions-section {
      flex-shrink: 0;
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

    ::ng-deep .mat-mdc-tab-group {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    ::ng-deep .mat-mdc-tab-header {
      padding: 0 20px;
    }

    ::ng-deep .mat-mdc-tab-body-content {
      padding: 20px;
    }

    .tab-content {
      min-height: 300px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
      color: #2d3748;
    }

    .visited-icon {
      color: #48bb78;
    }

    .want-icon {
      color: #ed8936;
    }

    .section-header.want-to-visit {
      margin-top: 40px;
    }

    .city-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .city-card {
      overflow: hidden;
    }

    .city-image {
      height: 120px;
      overflow: hidden;
    }

    .city-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .city-image-placeholder {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    }

    .city-image-placeholder mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      color: #a0aec0;
    }

    .city-info {
      padding: 12px;
    }

    .city-info h4 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .city-info p {
      margin: 0 0 8px 0;
      font-size: 0.85rem;
      color: #718096;
    }

    .city-rating {
      display: flex;
    }

    .city-rating mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #e2e8f0;
    }

    .city-rating mat-icon.filled {
      color: #f6ad55;
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
      position: relative;
    }

    .post-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-chip {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 0.75rem;
    }

    .status-chip.pending {
      background: rgba(237, 137, 54, 0.9) !important;
      color: white !important;
    }

    .status-chip.rejected {
      background: rgba(245, 101, 101, 0.9) !important;
      color: white !important;
    }

    .status-chip.draft {
      background: rgba(160, 174, 192, 0.9) !important;
      color: white !important;
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

      .actions-section {
        width: 100%;
      }

      .actions-section button {
        width: 100%;
      }

      .stats-row {
        flex-wrap: wrap;
        gap: 20px;
      }

      .stat-divider {
        display: none;
      }

      .city-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .posts-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .section-header button {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  PostStatus = PostStatus;

  profile: UserProfile | null = null;
  userCities: UserCity[] = [];
  posts: Post[] = [];
  isLoading = true;

  constructor(
    private userService: UserService,
    private cityService: CityService,
    private postService: PostService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  get visitedCities(): UserCity[] {
    return this.userCities.filter(c => c.status === CityStatus.VISITED);
  }

  get wantToVisitCities(): UserCity[] {
    return this.userCities.filter(c => c.status === CityStatus.WANT_TO_VISIT);
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserCities();
    this.loadPosts();
  }

  loadProfile(): void {
    this.userService.getCurrentUserProfile().subscribe({
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

  loadUserCities(): void {
    this.cityService.getUserCities().subscribe({
      next: (response) => {
        if (response.success) {
          this.userCities = response.data;
        }
      },
      error: () => {
        this.userCities = [];
      }
    });
  }

  loadPosts(): void {
    this.postService.getMyPosts(0, 100).subscribe({
      next: (response) => {
        if (response.success) {
          this.posts = response.data.content;
        }
      },
      error: () => {
        this.posts = [];
      }
    });
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '450px',
      data: { profile: this.profile }
    });

    dialogRef.afterClosed().subscribe((result: Partial<UserProfile> | null) => {
      if (result) {
        this.userService.updateProfile(result).subscribe({
          next: (response) => {
            if (response.success) {
              this.profile = response.data;
              this.snackBar.open('资料已更新', '关闭', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          },
          error: () => {
            this.snackBar.open('更新失败', '关闭', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
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

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        编辑资料
      </h2>
      <button mat-icon-button [mat-dialog-close]>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>昵称</mat-label>
          <input matInput formControlName="nickname" placeholder="显示给其他用户的名称">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>头像URL (可选)</mat-label>
          <input matInput formControlName="avatar" placeholder="输入头像图片URL">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>个人简介 (可选)</mat-label>
          <textarea matInput formControlName="bio" rows="3" placeholder="介绍一下自己..."></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]>取消</button>
        <button mat-raised-button color="primary" type="submit"
                [disabled]="profileForm.invalid">
          保存
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0 24px;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    mat-dialog-content {
      padding: 20px 24px !important;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-actions {
      padding: 16px 24px 24px 24px !important;
    }
  `]
})
export class EditProfileDialogComponent {
  profileForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    private fb: FormBuilder
  ) {
    const profile = (dialogRef.config.data as any)?.profile;
    this.profileForm = this.fb.group({
      nickname: [profile?.nickname || ''],
      avatar: [profile?.avatar || ''],
      bio: [profile?.bio || '']
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.dialogRef.close(this.profileForm.value);
  }
}
