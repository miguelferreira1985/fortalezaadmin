import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { HasRoleDirective } from '../../core/has-role.directive';

@Component({
  selector: 'app-dashboard',
  imports: [ 
    CommonModule,
    HasRoleDirective 
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  inventoryValue: number = 0;
  activeProducts: Product[] = [];
  lowStockProducts: Product[] = [];
  isActivate: boolean = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getInventoryValue();
    this.getLowStock();
    this.getActiveProducts()
  }

  getInventoryValue(): void {
    this.productService.getInventoryValue().subscribe(value => {
      this.inventoryValue = value;
    });
  }

  getLowStock(): void {
    this.productService.getLowStock().subscribe(data => {
      this.lowStockProducts = data;
    });
  }

  getActiveProducts(): void{
    this.productService.getProducts(this.isActivate).subscribe(data => {
      this.activeProducts = data;
    })
  }

}
