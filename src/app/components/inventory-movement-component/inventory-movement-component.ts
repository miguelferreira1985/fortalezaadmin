import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgSelectComponent } from "@ng-select/ng-select";
import { Product } from '../../models/product';
import { InventoryMovement } from '../../models/inventory-movement';
import { ProductService } from '../../services/product.service';
import { error } from 'jquery';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-movement-component',
  imports: [
    CommonModule,
    NgSelectComponent,
    FormsModule
  ],
  templateUrl: './inventory-movement-component.html',
  styleUrl: './inventory-movement-component.css'
})
export class InventoryMovementComponent implements OnInit {

  products: Product[] = [];
  selectedProductId: number | null = null;
  movements: InventoryMovement[] =[];
  filteredMovements: InventoryMovement[] = [];
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
        this.filteredMovements = [...this.movements];
      },
      error(err) {
        console.error(err);
      }
    });
  }

  filterMovements(): void {
    if (!this.searchItem) {
      this.filteredMovements = [...this.movements];
    } else {
      const lowerCaseSearchItem = this.searchItem.toLowerCase();
      this.filteredMovements = this.movements.filter(movment =>
        movment.createdBy.toLowerCase().includes(lowerCaseSearchItem) ||
        movment.movementType.toLowerCase().includes(lowerCaseSearchItem)
      );
    }
  }

}
