import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './core/services/auth.service';
import { JwtResponse } from './core/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <span class="logo" routerLink="/">
        <mat-icon class="logo-icon">explore</mat-icon>
        足记
      </span>
      
      <span class="spacer"></span>
      
      <nav class="nav-links">
        <button mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon>home</mat-icon>
          首页
        </button>
        
        <button mat-button routerLink="/map" routerLinkActive="active" *ngIf="authService.isLoggedIn()">
          <mat-icon>map</mat-icon>
          我的足迹
        </button>
        
        <button mat-button routerLink="/cities" routerLinkActive="active" *ngIf="authService.isLoggedIn()">
          <mat-icon>location_city</mat-icon>
          城市列表
        </button>
        
        <button mat-button routerLink="/posts" routerLinkActive="active">
          <mat-icon>article</mat-icon>
          游记
        </button>

        <button mat-button routerLink="/admin" routerLinkActive="active" *ngIf="authService.isAdmin()">
          <mat-icon>admin_panel_settings</mat-icon>
          审核
        </button>
      </nav>

      <span class="spacer"></span>

      <div class="user-actions" *ngIf="authService.isLoggedIn(); else loginSection">
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          {{ currentUser?.nickname || currentUser?.username }}
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            个人主页
          </button>
          <button mat-menu-item routerLink="/posts/create">
            <mat-icon>add_circle</mat-icon>
            发布游记
          </button>
          <button mat-menu-item routerLink="/map">
            <mat-icon>map</mat-icon>
            我的足迹
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            退出登录
          </button>
        </mat-menu>
      </div>

      <ng-template #loginSection>
        <div class="auth-buttons">
          <button mat-button routerLink="/login">登录</button>
          <button mat-raised-button color="accent" routerLink="/register">注册</button>
        </div>
      </ng-template>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <mat-icon>explore</mat-icon>
          <span>足记</span>
        </div>
        <p>记录每一次旅行，留下美好的回忆</p>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">使用条款</a>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .logo-icon {
      margin-right: 8px;
      font-size: 1.8rem;
      height: 1.8rem;
      width: 1.8rem;
    }

    .spacer {
      flex: 1;
    }

    .nav-links {
      display: flex;
      gap: 8px;
    }

    .nav-links button {
      color: rgba(255, 255, 255, 0.9);
      border-radius: 25px;
      transition: all 0.3s ease;
    }

    .nav-links button:hover,
    .nav-links button.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .user-actions {
      display: flex;
      align-items: center;
    }

    .user-actions button {
      color: white;
    }

    .auth-buttons {
      display: flex;
      gap: 10px;
    }

    .auth-buttons button:first-child {
      color: rgba(255, 255, 255, 0.9);
    }

    .main-content {
      flex: 1;
      background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .footer {
      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
      color: rgba(255, 255, 255, 0.8);
      padding: 30px 20px;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .footer-logo mat-icon {
      margin-right: 8px;
    }

    .footer-links {
      margin-top: 15px;
      display: flex;
      justify-content: center;
      gap: 30px;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: white;
    }
  `]
})
export class AppComponent {
  title = '足记';

  constructor(public authService: AuthService) {}

  get currentUser(): JwtResponse | null {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
