import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, PostStatus, AuditRequest } from '../../../core/models/post.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-title">
          <mat-icon>admin_panel_settings</mat-icon>
          <h1>内容审核</h1>
        </div>
        <p class="header-subtitle">审核用户发布的游记内容</p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <div class="stat-icon pending">
            <mat-icon>hourglass_empty</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ pendingCount }}</h3>
            <p>待审核</p>
          </div>
        </mat-card>
      </div>

      <!-- Posts List -->
      <mat-card class="posts-card">
        <h2 class="section-title">
          <mat-icon>list</mat-icon>
          待审核游记
        </h2>

        <div class="posts-container" *ngIf="!isLoading; else loading">
          <div class="posts-list" *ngIf="posts.length > 0; else noPosts">
            <div class="post-item" *ngFor="let post of posts">
              <div class="post-preview">
                <div class="post-image" *ngIf="post.coverImage || post.images?.length">
                  <img [src]="post.coverImage || post.images[0]" alt="{{post.title}}">
                </div>
                <div class="post-image-placeholder" *ngIf="!post.coverImage && !post.images?.length">
                  <mat-icon>image</mat-icon>
                </div>
              </div>

              <div class="post-info">
                <div class="post-header">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <mat-chip class="status-chip">待审核</mat-chip>
                </div>

                <div class="post-meta">
                  <span class="author">
                    <mat-icon>person</mat-icon>
                    {{ post.userNickname || post.username }}
                  </span>
                  <span class="city" *ngIf="post.cityName">
                    <mat-icon>location_on</mat-icon>
                    {{ post.cityName }}
                  </span>
                  <span class="date">
                    <mat-icon>schedule</mat-icon>
                    {{ post.createdAt | date:'yyyy-MM-dd HH:mm' }}
                  </span>
                </div>

                <div class="post-excerpt">
                  {{ post.content | slice:0:200 }}...
                </div>

                <div class="post-actions">
                  <button mat-button routerLink="/posts/{{post.id}}" target="_blank">
                    <mat-icon>visibility</mat-icon>
                    查看详情
                  </button>
                  <button mat-raised-button color="primary" (click)="openAuditDialog(post, true)">
                    <mat-icon>check_circle</mat-icon>
                    通过
                  </button>
                  <button mat-raised-button color="warn" (click)="openAuditDialog(post, false)">
                    <mat-icon>cancel</mat-icon>
                    拒绝
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noPosts>
            <div class="empty-state">
              <mat-icon>check_circle_outline</mat-icon>
              <h3>暂无待审核内容</h3>
              <p>所有游记都已审核完成</p>
            </div>
          </ng-template>

          <!-- Pagination -->
          <mat-paginator [length]="totalElements"
                         [pageSize]="pageSize"
                         [pageSizeOptions]="[5, 10, 20]"
                         (page)="onPageChange($event)"
                         showFirstLastButtons
                         *ngIf="totalElements > 0">
          </mat-paginator>
        </div>

        <ng-template #loading>
          <div class="loading-container">
            <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
            <p>加载中...</p>
          </div>
        </ng-template>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
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
      margin: 0;
      color: #2d3748;
    }

    .header-subtitle {
      margin: 0;
      color: #718096;
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.pending {
      background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    }

    .stat-icon mat-icon {
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
      color: white;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .stat-content p {
      color: #718096;
      margin: 0;
    }

    .posts-card {
      padding: 30px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #2d3748;
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

    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .post-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .post-preview {
      flex-shrink: 0;
    }

    .post-image {
      width: 150px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
    }

    .post-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .post-image-placeholder {
      width: 150px;
      height: 120px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    }

    .post-image-placeholder mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      color: #a0aec0;
    }

    .post-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      gap: 10px;
    }

    .post-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0;
      color: #2d3748;
      flex: 1;
    }

    .status-chip {
      background: rgba(237, 137, 54, 0.1) !important;
      color: #dd6b20 !important;
      border: 1px solid rgba(237, 137, 54, 0.3);
      font-size: 0.8rem;
    }

    .post-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .post-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #718096;
    }

    .post-excerpt {
      color: #4a5568;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .post-actions {
      display: flex;
      gap: 12px;
      margin-top: auto;
      flex-wrap: wrap;
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
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .post-item {
        flex-direction: column;
      }

      .post-image,
      .post-image-placeholder {
        width: 100%;
        height: 180px;
      }

      .post-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .post-meta {
        flex-direction: column;
        gap: 8px;
      }

      .post-actions {
        flex-direction: column;
      }

      .post-actions button {
        width: 100%;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  PostStatus = PostStatus;

  posts: Post[] = [];
  isLoading = true;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  constructor(
    private postService: PostService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  get pendingCount(): number {
    return this.totalElements;
  }

  ngOnInit(): void {
    this.loadPendingPosts();
  }

  loadPendingPosts(): void {
    this.isLoading = true;

    this.postService.getPendingPosts(this.currentPage, this.pageSize).subscribe({
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

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPendingPosts();
  }

  openAuditDialog(post: Post, approved: boolean): void {
    const dialogRef = this.dialog.open(AuditDialogComponent, {
      width: '450px',
      data: { post, approved }
    });

    dialogRef.afterClosed().subscribe((reason: string | null) => {
      if (reason !== null) {
        this.submitAudit(post.id, approved, reason);
      }
    });
  }

  submitAudit(postId: number, approved: boolean, reason: string): void {
    const request: AuditRequest = {
      postId,
      approved,
      reason: reason || undefined
    };

    this.postService.auditPost(request).subscribe({
      next: (response) => {
        if (response.success) {
          const message = approved ? '审核通过' : '已拒绝';
          this.snackBar.open(message, '关闭', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPendingPosts();
        }
      },
      error: () => {
        this.snackBar.open('操作失败', '关闭', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

@Component({
  selector: 'app-audit-dialog',
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
        <mat-icon [color]="data.approved ? 'primary' : 'warn'">
          {{ data.approved ? 'check_circle' : 'cancel' }}
        </mat-icon>
        {{ data.approved ? '通过审核' : '拒绝审核' }}
      </h2>
      <button mat-icon-button [mat-dialog-close]>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <div class="dialog-content">
      <p class="post-title">「{{ data.post.title }}」</p>
      <p *ngIf="!data.approved" class="reject-notice">
        请填写拒绝原因：
      </p>
    </div>

    <form [formGroup]="auditForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width" *ngIf="!data.approved">
          <mat-label>原因</mat-label>
          <textarea matInput formControlName="reason" rows="3"
                    placeholder="请说明拒绝原因..."></textarea>
          <mat-error *ngIf="auditForm.get('reason')?.hasError('required')">
            拒绝原因不能为空
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]>取消</button>
        <button mat-raised-button [color]="data.approved ? 'primary' : 'warn'" type="submit"
                [disabled]="!data.approved && auditForm.invalid">
          确认
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

    .dialog-content {
      padding: 20px 24px 0 24px;
    }

    .post-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 10px 0;
    }

    .reject-notice {
      color: #c53030;
      margin: 0;
      font-weight: 500;
    }

    mat-dialog-content {
      padding: 10px 24px !important;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 24px 24px 24px !important;
    }
  `]
})
export class AuditDialogComponent {
  auditForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AuditDialogComponent>,
    private fb: FormBuilder
  ) {
    const data = (dialogRef.config.data as any);
    this.auditForm = this.fb.group({
      reason: [null, data.approved ? [] : [Validators.required]]
    });
  }

  get data(): any {
    return this.dialogRef.config.data;
  }

  onSubmit(): void {
    if (!this.data.approved && this.auditForm.invalid) return;
    this.dialogRef.close(this.auditForm.value.reason);
  }
}
