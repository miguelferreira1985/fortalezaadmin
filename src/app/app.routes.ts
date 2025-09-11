import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LoginComponent } from './components/auth/login/login';
import { authGuard } from './components/auth/auth.guard';
import { BlankComponent } from './components/layouts/blank/blank';
import { MainLayoutComponent } from './components/layouts/main-layout/main-layout';
import { ProductComponent } from './components/product/product';
import { SubcategoryComponent } from './components/subcategory/subcategory';
import { PresentationComponent } from './components/presentation/presentation';
import { CategoryComponent } from './components/category/category';

export const routes: Routes = [
      // Routes without a layout (Login, etc.)
  {
    path: '',
    component: BlankComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent }
    ]
  },
  // Routes with the AdminLTE layout, protected by the guard
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'product', component: ProductComponent},
      { path: 'presentation', component: PresentationComponent},
      { path: 'subcategory', component: SubcategoryComponent },
      { path: 'category', component: CategoryComponent}
    ]
  }
];
