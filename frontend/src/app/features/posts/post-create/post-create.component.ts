import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostService } from '../../../core/services/post.service';
import { CityService } from '../../../core/services/city.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, CreatePostRequest, PostStatus } from '../../../core/models/post.model';
import { City } from '../../../core/models/city.model';

@Component({
  selector: 'app-post-create',
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
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="back-nav">
        <button mat-button routerLink="/posts">
          <mat-icon>arrow_back</mat-icon>
          返回
        </button>
      </div>

      <mat-card class="form-card">
        <h1 class="page-title">
          <mat-icon>edit</mat-icon>
          {{ isEdit ? '编辑游记' : '发布游记' }}
        </h1>

        <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
          <!-- City Selection -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>关联城市 (可选)</mat-label>
            <mat-select formControlName="cityId">
              <mat-option [value]="null">不关联城市</mat-option>
              <mat-option *ngFor="let city of cities" [value]="city.id">
                {{ city.name }} - {{ city.country }}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>location_on</mat-icon>
          </mat-form-field>

          <!-- Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>标题</mat-label>
            <input matInput formControlName="title" placeholder="给你的游记起个吸引人的标题">
            <mat-error *ngIf="postForm.get('title')?.hasError('required')">
              标题不能为空
            </mat-error>
            <mat-error *ngIf="postForm.get('title')?.hasError('maxlength')">
              标题不能超过200个字符
            </mat-error>
          </mat-form-field>

          <!-- Cover Image -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>封面图片URL (可选)</mat-label>
            <input matInput formControlName="coverImage" placeholder="输入图片URL">
            <mat-icon matPrefix>image</mat-icon>
          </mat-form-field>

          <!-- Content -->
          <mat-form-field appearance="outline" class="full-width content-field">
            <mat-label>游记内容</mat-label>
            <textarea matInput formControlName="content" rows="12"
                      placeholder="分享你的旅行故事..."></textarea>
            <mat-error *ngIf="postForm.get('content')?.hasError('required')">
              内容不能为空
            </mat-error>
          </mat-form-field>

          <!-- Images List -->
          <div class="images-section">
            <h3>图片列表 (可选)</h3>
            <div class="image-inputs">
              <div *ngFor="let image of imagesArray.controls; let i = index" class="image-input-row">
                <mat-form-field appearance="outline" class="image-url-field">
                  <mat-label>图片 {{ i + 1 }}</mat-label>
                  <input matInput [formControl]="image" placeholder="输入图片URL">
                </mat-form-field>
                <button mat-icon-button color="warn" (click)="removeImage(i)"
                        [disabled]="imagesArray.length <= 1">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            <button mat-stroked-button type="button" (click)="addImage()">
              <mat-icon>add_photo_alternate</mat-icon>
              添加图片
            </button>
          </div>

          <!-- Submit Actions -->
          <div class="submit-actions">
            <button mat-stroked-button type="button" (click)="saveAsDraft()"
                    [disabled]="isSubmitting || !postForm.valid">
              <mat-icon>draft</mat-icon>
              保存为草稿
            </button>
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="isSubmitting || !postForm.valid">
              <mat-progress-spinner *ngIf="isSubmitting" mode="indeterminate" diameter="20"></mat-progress-spinner>
              <span *ngIf="!isSubmitting">
                <mat-icon>{{ isEdit ? 'save' : 'publish' }}</mat-icon>
                {{ isEdit ? '保存修改' : '发布游记' }}
              </span>
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .back-nav {
      margin-bottom: 20px;
    }

    .form-card {
      padding: 40px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0 0 30px 0;
      color: #2d3748;
    }

    .page-title mat-icon {
      color: #667eea;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .full-width {
      width: 100%;
    }

    .content-field textarea {
      line-height: 1.8;
    }

    .images-section {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .images-section h3 {
      margin: 0 0 16px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .image-inputs {
      margin-bottom: 16px;
    }

    .image-input-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }

    .image-url-field {
      flex: 1;
    }

    .submit-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .submit-actions button {
      min-width: 140px;
      height: 48px;
    }

    @media (max-width: 768px) {
      .form-card {
        padding: 20px;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .submit-actions {
        flex-direction: column-reverse;
      }

      .submit-actions button {
        width: 100%;
      }
    }
  `]
})
export class PostCreateComponent implements OnInit {
  isEdit = false;
  isSubmitting = false;
  cities: City[] = [];
  postId: number | null = null;
  existingPost: Post | null = null;

  postForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private postService: PostService,
    private cityService: CityService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.postForm = this.fb.group({
      cityId: [null],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required]],
      coverImage: [''],
      images: this.fb.array([this.fb.control('')])
    });
  }

  get imagesArray() {
    return this.postForm.get('images') as any;
  }

  ngOnInit(): void {
    this.loadCities();

    const postId = this.route.snapshot.params['id'];
    if (postId) {
      this.isEdit = true;
      this.postId = +postId;
      this.loadPostForEdit(+postId);
    }
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

  loadPostForEdit(postId: number): void {
    this.postService.getPostById(postId).subscribe({
      next: (response) => {
        if (response.success) {
          this.existingPost = response.data;

          const currentUser = this.authService.getCurrentUser();
          if (currentUser?.id !== this.existingPost.userId) {
            this.snackBar.open('无权编辑此游记', '关闭', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.router.navigate(['/posts']);
            return;
          }

          this.postForm.patchValue({
            cityId: this.existingPost.cityId,
            title: this.existingPost.title,
            content: this.existingPost.content,
            coverImage: this.existingPost.coverImage
          });

          // Clear default image control and add existing images
          while (this.imagesArray.length > 0) {
            this.imagesArray.removeAt(0);
          }

          if (this.existingPost.images?.length > 0) {
            this.existingPost.images.forEach(image => {
              this.imagesArray.push(this.fb.control(image));
            });
          } else {
            this.imagesArray.push(this.fb.control(''));
          }
        }
      },
      error: () => {
        this.snackBar.open('加载游记失败', '关闭', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/posts']);
      }
    });
  }

  addImage(): void {
    this.imagesArray.push(this.fb.control(''));
  }

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
  }

  private getImages(): string[] {
    return this.imagesArray.value
      .filter((url: string) => url && url.trim())
      .map((url: string) => url.trim());
  }

  saveAsDraft(): void {
    if (!this.postForm.valid) return;

    const formValue = this.postForm.value;
    const request: CreatePostRequest = {
      cityId: formValue.cityId || undefined,
      title: formValue.title,
      content: formValue.content,
      coverImage: formValue.coverImage || undefined,
      images: this.getImages(),
      asDraft: true
    };

    this.submitPost(request);
  }

  onSubmit(): void {
    if (!this.postForm.valid) return;

    const formValue = this.postForm.value;
    const request: CreatePostRequest = {
      cityId: formValue.cityId || undefined,
      title: formValue.title,
      content: formValue.content,
      coverImage: formValue.coverImage || undefined,
      images: this.getImages()
    };

    this.submitPost(request);
  }

  private submitPost(request: CreatePostRequest): void {
    this.isSubmitting = true;

    const submit$ = this.isEdit && this.postId
      ? this.postService.updatePost(this.postId, request)
      : this.postService.createPost(request);

    submit$.subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          const message = request.asDraft
            ? '草稿已保存'
            : (this.isEdit ? '游记已更新' : '游记已提交审核');

          this.snackBar.open(message, '关闭', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          if (request.asDraft || this.isEdit) {
            this.router.navigate(['/posts/my']);
          } else {
            this.router.navigate(['/posts']);
          }
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err.error?.message || '操作失败', '关闭', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
