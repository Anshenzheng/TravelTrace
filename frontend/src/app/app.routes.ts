import { Routes } from '@angular/router';
import { authGuard, adminGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent),
    canActivate: [publicGuard]
  },
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'map',
    loadComponent: () => import('./features/map/map.component')
      .then(m => m.MapComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cities',
    loadComponent: () => import('./features/cities/cities.component')
      .then(m => m.CitiesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/posts/post-list/post-list.component')
          .then(m => m.PostListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/posts/post-create/post-create.component')
          .then(m => m.PostCreateComponent),
        canActivate: [authGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./features/posts/post-detail/post-detail.component')
          .then(m => m.PostDetailComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./features/posts/post-create/post-create.component')
          .then(m => m.PostCreateComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./features/profile/public-profile/public-profile.component')
      .then(m => m.PublicProfileComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component')
      .then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
