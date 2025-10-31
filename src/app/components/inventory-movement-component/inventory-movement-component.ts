import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgSelectComponent } from "@ng-select/ng-select";
import { Product } from '../../models/product';
import { InventoryMovement } from '../../models/inventory-movement';
import { ProductService } from '../../services/product.service';
import { error } from 'jquery';
import { FormsModule } from '@angular/forms';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';

@Component({
  selector: 'app-inventory-movement-component',
  imports: [
    CommonModule,
    NgSelectComponent,
    FormsModule,
    FilterByPipe
  ],
  templateUrl: './inventory-movement-component.html'
})
export class InventoryMovementComponent implements OnInit {

  products: Product[] = [];
  selectedProductId: number | null = null;
  movements: InventoryMovement[] =[];
  searchItem: string = '';

  constructor(
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts(true).subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }

  loadMovements(productId: number | null): void {
    if (!productId) return;
    this.productService.getInventoryMovementByProdcut(productId).subscribe({
      next: (res) => {
        this.movements = res.data;
      },
      error(err) {
        console.error(err);
      }
    });
  }

}
