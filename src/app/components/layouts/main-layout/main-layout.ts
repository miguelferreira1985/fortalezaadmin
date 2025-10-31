import { AfterViewInit, Component } from '@angular/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RouterLink } from "@angular/router";
import { HasRoleDirective } from '../../../core/has-role.directive';

declare const $: any; 

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    HasRoleDirective
  ],
  templateUrl: './main-layout.html'
})
export class MainLayoutComponent implements AfterViewInit {

  constructor(private authService: AuthService) {}

  ngAfterViewInit(): void {
    // 🔁 Esperar a que la vista esté lista y luego inicializar los menús colapsables
    this.initializeSidebar();
  }

  private initializeSidebar(): void {
    setTimeout(() => {
      // Esto re-inicializa el treeview de AdminLTE
      $('[data-widget="treeview"]').Treeview('init');
    }, 200);
  }


  logout(): void {
    this.authService.logout();
  }

}
