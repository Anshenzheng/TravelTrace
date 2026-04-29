import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Post, Comment, CreateCommentRequest, PostStatus } from '../../../../core/models/post.model';

@Component({
  selector: 'app-post-detail',
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="back-nav">
        <button mat-button routerLink="/posts">
          <mat-icon>arrow_back</mat-icon>
          返回列表
        </button>
      </div>

      <div *ngIf="!isLoading; else loading">
        <mat-card class="post-card" *ngIf="post">
          <!-- Post Header -->
          <div class="post-header">
            <div class="author-info">
              <div class="avatar-placeholder">
                <mat-icon>person</mat-icon>
              </div>
              <div class="author-details">
                <h3 class="author-name">{{ post.userNickname || post.username }}</h3>
                <p class="post-date">{{ post.createdAt | date:'yyyy年MM月dd日 HH:mm' }}</p>
              </div>
            </div>
            <div class="post-actions" *ngIf="isAuthor">
              <button mat-icon-button color="primary" matTooltip="编辑"
                      [routerLink]="['/posts/edit', post.id]">
                <mat-icon>edit</mat-icon>
              </button>
            </div>
          </div>

          <!-- Status Badge -->
          <mat-chip class="status-chip" [class.pending]="post.status === PostStatus.PENDING"
                     [class.rejected]="post.status === PostStatus.REJECTED"
                     [class.draft]="post.status === PostStatus.DRAFT"
                     *ngIf="post.status !== PostStatus.APPROVED">
            {{ getStatusText(post.status) }}
            <span *ngIf="post.rejectReason">: {{ post.rejectReason }}</span>
          </mat-chip>

          <!-- Post Title -->
          <h1 class="post-title">{{ post.title }}</h1>

          <!-- City & Meta -->
          <div class="post-meta-top">
            <mat-chip *ngIf="post.cityName" class="city-chip">
              <mat-icon>location_on</mat-icon>
              {{ post.cityName }}
            </mat-chip>
            <div class="view-count">
              <mat-icon>visibility</mat-icon>
              <span>{{ post.views }} 阅读</span>
            </div>
          </div>

          <!-- Post Images -->
          <div class="post-images" *ngIf="post.images?.length > 0">
            <div class="image-grid">
              <img *ngFor="let image of post.images; let i = index"
                   [src]="image"
                   alt="游记图片 {{ i + 1 }}">
            </div>
          </div>

          <!-- Post Content -->
          <div class="post-content">
            {{ post.content }}
          </div>

          <!-- Like & Stats Bar -->
          <div class="interaction-bar">
            <button mat-raised-button [color]="post.isLiked ? 'accent' : 'primary'"
                    (click)="toggleLike()" [disabled]="!authService.isLoggedIn()">
              <mat-icon>{{ post.isLiked ? 'favorite' : 'favorite_border' }}</mat-icon>
              {{ post.likesCount }} 点赞
            </button>
            <div class="stats-right">
              <span><mat-icon>comment</mat-icon> {{ post.commentsCount }} 评论</span>
            </div>
          </div>
        </mat-card>

        <!-- Comments Section -->
        <mat-card class="comments-card">
          <h2 class="section-title">
            <mat-icon>comment</mat-icon>
            评论 ({{ comments.length }})
          </h2>

          <!-- Comment Input -->
          <div class="comment-input-section" *ngIf="authService.isLoggedIn()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>写下你的评论...</mat-label>
              <textarea matInput [formControl]="commentControl" rows="2"></textarea>
              <button matSuffix mat-icon-button color="primary"
                      (click)="submitComment()"
                      [disabled]="!commentControl.valid">
                <mat-icon>send</mat-icon>
              </button>
            </mat-form-field>
          </div>

          <div class="comment-input-prompt" *ngIf="!authService.isLoggedIn()">
            <p>请 <a routerLink="/login">登录</a> 后发表评论</p>
          </div>

          <!-- Comments List -->
          <div class="comments-list">
            <div class="comment-item" *ngFor="let comment of comments">
              <div class="comment-author">
                <div class="avatar-placeholder small">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="author-info">
                  <span class="author-name">{{ comment.nickname || comment.username }}</span>
                  <span class="comment-date">{{ comment.createdAt | date:'yyyy-MM-dd HH:mm' }}</span>
                </div>
                <button mat-icon-button class="reply-btn" (click)="startReply(comment)"
                        *ngIf="authService.isLoggedIn()">
                  <mat-icon>reply</mat-icon>
                </button>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>

              <!-- Replies -->
              <div class="replies" *ngIf="comment.replies?.length > 0">
                <div class="reply-item" *ngFor="let reply of comment.replies">
                  <div class="comment-author">
                    <div class="avatar-placeholder tiny">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="author-info">
                      <span class="author-name">{{ reply.nickname || reply.username }}</span>
                      <span class="comment-date">{{ reply.createdAt | date:'yyyy-MM-dd HH:mm' }}</span>
                    </div>
                  </div>
                  <div class="comment-content">
                    {{ reply.content }}
                  </div>
                </div>
              </div>

              <!-- Reply Input -->
              <div class="reply-input" *ngIf="replyingTo === comment.id">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>回复 {{ comment.nickname || comment.username }}...</mat-label>
                  <input matInput [formControl]="replyControl">
                  <button matSuffix mat-button (click)="cancelReply()">取消</button>
                  <button matSuffix mat-icon-button color="primary"
                          (click)="submitReply(comment)"
                          [disabled]="!replyControl.valid">
                    <mat-icon>send</mat-icon>
                  </button>
                </mat-form-field>
              </div>

              <mat-divider></mat-divider>
            </div>

            <div class="empty-state" *ngIf="comments.length === 0">
              <mat-icon>chat_bubble_outline</mat-icon>
              <p>暂无评论，快来抢沙发吧！</p>
            </div>
          </div>
        </mat-card>
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
      max-width: 900px;
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

    .post-card {
      padding: 30px;
      margin-bottom: 30px;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-placeholder {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-placeholder.small {
      width: 40px;
      height: 40px;
    }

    .avatar-placeholder.tiny {
      width: 32px;
      height: 32px;
    }

    .avatar-placeholder mat-icon {
      color: white;
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .avatar-placeholder.small mat-icon {
      font-size: 1.2rem;
      height: 1.2rem;
      width: 1.2rem;
    }

    .avatar-placeholder.tiny mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
    }

    .author-details .author-name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: #2d3748;
    }

    .author-details .post-date {
      font-size: 0.85rem;
      margin: 0;
      color: #718096;
    }

    .status-chip {
      margin-bottom: 20px;
      font-size: 0.85rem;
    }

    .status-chip.pending {
      background: rgba(237, 137, 54, 0.1) !important;
      color: #dd6b20 !important;
      border: 1px solid rgba(237, 137, 54, 0.3);
    }

    .status-chip.rejected {
      background: rgba(245, 101, 101, 0.1) !important;
      color: #c53030 !important;
      border: 1px solid rgba(245, 101, 101, 0.3);
    }

    .status-chip.draft {
      background: rgba(160, 174, 192, 0.1) !important;
      color: #718096 !important;
      border: 1px solid rgba(160, 174, 192, 0.3);
    }

    .post-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 20px 0;
      color: #2d3748;
      line-height: 1.4;
    }

    .post-meta-top {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .city-chip {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 0.9rem;
    }

    .view-count {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #718096;
      font-size: 0.9rem;
    }

    .post-images {
      margin-bottom: 20px;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }

    .image-grid img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .image-grid img:hover {
      transform: scale(1.02);
    }

    .post-content {
      font-size: 1.05rem;
      line-height: 2;
      color: #2d3748;
      margin-bottom: 30px;
      white-space: pre-wrap;
    }

    .interaction-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .stats-right {
      color: #718096;
    }

    .stats-right span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .comments-card {
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

    .comment-input-section {
      margin-bottom: 30px;
    }

    .comment-input-prompt {
      text-align: center;
      padding: 20px;
      color: #718096;
      margin-bottom: 20px;
    }

    .comment-input-prompt a {
      color: #667eea;
      text-decoration: none;
    }

    .full-width {
      width: 100%;
    }

    .comments-list {
      margin-top: 20px;
    }

    .comment-item {
      margin-bottom: 20px;
    }

    .comment-author {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .author-info {
      flex: 1;
    }

    .author-name {
      font-weight: 600;
      color: #2d3748;
      margin-right: 10px;
    }

    .comment-date {
      font-size: 0.8rem;
      color: #a0aec0;
    }

    .reply-btn {
      color: #667eea;
    }

    .comment-content {
      color: #2d3748;
      line-height: 1.6;
      margin-left: 50px;
      margin-bottom: 15px;
    }

    .replies {
      margin-left: 50px;
      padding-left: 20px;
      border-left: 2px solid #e2e8f0;
    }

    .reply-item {
      margin-bottom: 15px;
    }

    .reply-input {
      margin-left: 50px;
      margin-bottom: 15px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #718096;
    }

    .empty-state mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      margin-bottom: 15px;
      opacity: 0.3;
    }

    @media (max-width: 768px) {
      .post-card, .comments-card {
        padding: 20px;
      }

      .post-title {
        font-size: 1.4rem;
      }

      .image-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .image-grid img {
        height: 150px;
      }
    }
  `]
})
export class PostDetailComponent implements OnInit {
  PostStatus = PostStatus;

  post: Post | null = null;
  comments: Comment[] = [];
  isLoading = true;
  isAuthor = false;

  commentControl = this.fb.control('', [Validators.required]);
  replyControl = this.fb.control('', [Validators.required]);
  replyingTo: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    public authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.params['id'];
    if (postId) {
      this.loadPost(+postId);
      this.loadComments(+postId);
    }
  }

  loadPost(postId: number): void {
    this.postService.getPostById(postId).subscribe({
      next: (response) => {
        if (response.success) {
          this.post = response.data;
          const currentUser = this.authService.getCurrentUser();
          this.isAuthor = currentUser?.id === this.post.userId;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('加载游记失败', '关闭', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadComments(postId: number): void {
    this.postService.getCommentsByPost(postId).subscribe({
      next: (response) => {
        if (response.success) {
          this.comments = response.data;
        }
      },
      error: () => {
        this.comments = [];
      }
    });
  }

  toggleLike(): void {
    if (!this.post) return;

    this.postService.toggleLike(this.post.id).subscribe({
      next: (response) => {
        if (response.success && this.post) {
          this.post.isLiked = response.data;
          this.post.likesCount += response.data ? 1 : -1;
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

  submitComment(): void {
    if (!this.commentControl.valid || !this.post) return;

    const request: CreateCommentRequest = {
      postId: this.post.id,
      content: this.commentControl.value!
    };

    this.postService.createComment(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('评论成功', '关闭', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.commentControl.reset();
          this.loadComments(this.post!.id);
          if (this.post) {
            this.post.commentsCount++;
          }
        }
      },
      error: () => {
        this.snackBar.open('评论失败', '关闭', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  startReply(comment: Comment): void {
    this.replyingTo = comment.id;
    this.replyControl.reset();
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyControl.reset();
  }

  submitReply(comment: Comment): void {
    if (!this.replyControl.valid || !this.post) return;

    const request: CreateCommentRequest = {
      postId: this.post.id,
      parentId: comment.id,
      content: this.replyControl.value!
    };

    this.postService.createComment(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('回复成功', '关闭', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.cancelReply();
          this.loadComments(this.post!.id);
        }
      },
      error: () => {
        this.snackBar.open('回复失败', '关闭', {
          duration: 3000,
          panelClass: ['error-snackbar']
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
