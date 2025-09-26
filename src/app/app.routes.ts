import { Routes } from '@angular/router';
import { authGuard } from './components/auth/auth.guard';
import { BlankComponent } from './components/layouts/blank/blank';
import { MainLayoutComponent } from './components/layouts/main-layout/main-layout';

export const routes: Routes = [
      // Routes without a layout (Login, etc.)
  {
    path: '',
    component: BlankComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { 
        path: 'login', 
        loadComponent: () =>
          import('./components/auth/login/login').then(m => m.LoginComponent)
      }
    ]
  },
  // Routes with the AdminLTE layout, protected by the guard
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      { 
        path: 'product',
        loadComponent: () =>
          import('./components/product-component/product-component').then(m => m.ProductComponent)
      },
      { 
        path: 'presentation',
        loadComponent: () =>
          import('./components/presentation-component/presentation-component').then(m => m.PresentationComponent)
      },
      { 
        path: 'subcategory',
        loadComponent: () =>
          import('./components/subcategory-component/subcategory-component').then(m => m.SubcategoryComponent)
      },
      { 
        path: 'category',
        loadComponent: () =>
          import('./components/category-component/category-component').then(m => m.CategoryComponent)
      },
      { 
        path: 'client',
        loadComponent: () =>
          import('./components/client-component/client-component').then(m => m.ClientComponent)
      },
      { 
        path: 'supplier',
        loadComponent: () =>
          import('./components/supplier-component/supplier-component').then(m => m.SupplierComponent)
      },
      { 
        path: 'employee',
        loadComponent: () =>
          import('./components/employee-component/employee-component').then(m => m.EmployeeComponent)
      }
    ]
  }
];
