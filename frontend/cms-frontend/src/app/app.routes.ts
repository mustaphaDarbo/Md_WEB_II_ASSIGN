import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./article-view/article-view.component').then(m => m.ArticleViewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'articles',
        loadComponent: () =>
          import('./articles/articles-list.component').then(m => m.ArticlesComponent)
      },
      {
        path: 'articles/create',
        loadComponent: () =>
          import('./articles/article-form.component').then(m => m.ArticleFormComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'create' }
      },
      {
        path: 'articles/edit/:id',
        loadComponent: () =>
          import('./articles/article-form.component').then(m => m.ArticleFormComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'edit' }
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./users/users.component').then(m => m.UsersComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'manageUsers' }
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./roles/roles.component').then(m => m.RolesComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'manageRoles' }
      },
      {
        path: 'access-matrix',
        loadComponent: () =>
          import('./access-matrix/access-matrix.component').then(m => m.AccessMatrixComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'manageRoles' }
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  }
];
