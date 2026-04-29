import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <mat-card class="register-card">
        <div class="card-header">
          <div class="logo">
            <mat-icon>explore</mat-icon>
            <span>足记</span>
          </div>
          <p>创建账号，开始记录你的旅行足迹</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>用户名</mat-label>
            <input matInput formControlName="username" placeholder="3-50个字符">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
              请输入用户名
            </mat-error>
            <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">
              用户名至少3个字符
            </mat-error>
            <mat-error *ngIf="registerForm.get('username')?.hasError('maxlength')">
              用户名最多50个字符
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>邮箱</mat-label>
            <input matInput formControlName="email" type="email" placeholder="请输入邮箱地址">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
              请输入邮箱
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
              请输入有效的邮箱地址
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>昵称 (可选)</mat-label>
            <input matInput formControlName="nickname" placeholder="显示给其他用户的名称">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="registerForm.get('nickname')?.hasError('maxlength')">
              昵称最多50个字符
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>密码</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'"
                   placeholder="至少6个字符">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
              请输入密码
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
              密码至少6个字符
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>确认密码</mat-label>
            <input matInput formControlName="confirmPassword" [type]="hideConfirmPassword ? 'password' : 'text'"
                   placeholder="请再次输入密码">
            <mat-icon matPrefix>lock_outline</mat-icon>
            <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
              <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
              请确认密码
            </mat-error>
            <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
              两次输入的密码不一致
            </mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" class="submit-btn" type="submit"
                  [disabled]="registerForm.invalid || isLoading">
            <mat-icon *ngIf="isLoading">hourglass_top</mat-icon>
            <span *ngIf="!isLoading">注册</span>
            <span *ngIf="isLoading">注册中...</span>
          </button>
        </form>

        <div class="divider">
          <span>已有账号？</span>
        </div>

        <button mat-stroked-button color="primary" class="login-btn" routerLink="/login">
          <mat-icon>login</mat-icon>
          立即登录
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: calc(100vh - 128px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    }

    .register-card {
      width: 100%;
      max-width: 480px;
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
      gap: 16px;
    }

    .submit-btn {
      height: 50px;
      font-size: 1.1rem;
      font-weight: 500;
      margin-top: 10px;
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

    .login-btn {
      width: 100%;
      height: 50px;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      nickname: ['', [Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const formValue = this.registerForm.value;
    const request: RegisterRequest = {
      username: formValue.username,
      password: formValue.password,
      email: formValue.email,
      nickname: formValue.nickname || undefined
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('注册成功！欢迎加入足记', '关闭', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/']);
        } else {
          this.snackBar.open(response.message || '注册失败', '关闭', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || '注册失败，请稍后重试', '关闭', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
