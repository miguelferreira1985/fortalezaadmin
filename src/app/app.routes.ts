import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LoginComponent } from './components/auth/login/login';
import { authGuard } from './components/auth/auth.guard';
import { BlankComponent } from './components/layouts/blank/blank';
import { MainLayoutComponent } from './components/layouts/main-layout/main-layout';
import { ProductComponent } from './components/product-component/product-component';
import { SubcategoryComponent } from './components/subcategory-component/subcategory-component';
import { PresentationComponent } from './components/presentation-component/presentation-component';
import { CategoryComponent } from './components/category-component/category-component';
import { ClientComponent } from './components/client-component/client-component';
import { SupplierComponent } from './components/supplier-component/supplier-component';
import { EmployeeComponent } from './components/employee-component/employee-component';

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
      { path: 'category', component: CategoryComponent},
      { path: 'client', component: ClientComponent},
      { path: 'supplier', component: SupplierComponent},
      { path: 'employee', component: EmployeeComponent}
    ]
  }
];
