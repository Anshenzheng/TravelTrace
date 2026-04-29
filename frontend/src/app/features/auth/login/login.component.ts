import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="card-header">
          <div class="logo">
            <mat-icon>explore</mat-icon>
            <span>足记</span>
          </div>
          <p>欢迎回来，继续你的旅行之旅</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>用户名或邮箱</mat-label>
            <input matInput formControlName="username" placeholder="请输入用户名或邮箱">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
              请输入用户名或邮箱
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>密码</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'"
                   placeholder="请输入密码">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              请输入密码
            </mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" class="submit-btn" type="submit"
                  [disabled]="loginForm.invalid || isLoading">
            <mat-icon *ngIf="isLoading">hourglass_top</mat-icon>
            <span *ngIf="!isLoading">登录</span>
            <span *ngIf="isLoading">登录中...</span>
          </button>
        </form>

        <div class="divider">
          <span>还没有账号？</span>
        </div>

        <button mat-stroked-button color="primary" class="register-btn" routerLink="/register">
          <mat-icon>person_add</mat-icon>
          立即注册
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - 128px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 10px;
    }

    .logo mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      margin-right: 10px;
    }

    .card-header p {
      color: #718096;
      font-size: 1rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .submit-btn {
      height: 50px;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 30px 0;
      color: #a0aec0;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .divider span {
      padding: 0 15px;
    }

    .register-btn {
      width: 100%;
      height: 50px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const request: LoginRequest = this.loginForm.value;

    this.authService.login(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('登录成功！', '关闭', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.snackBar.open(response.message || '登录失败', '关闭', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || '登录失败，请稍后重试', '关闭', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
