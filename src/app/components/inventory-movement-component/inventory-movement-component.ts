import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgSelectComponent } from "@ng-select/ng-select";
import { Product } from '../../models/product';
import { InventoryMovement } from '../../models/inventory-movement';
import { FormsModule } from '@angular/forms';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { InventoryMovementService } from '../../services/inventory-movement.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-inventory-movement-component',
  imports: [
    CommonModule,
    NgSelectComponent,
    FormsModule,
    FilterByPipe
  ],
  templateUrl: './inventory-movement-component.html',
  styleUrl: './inventory-movement-component.css'
})
export class InventoryMovementComponent implements OnInit {

  products: Product[] = [];
  selectedProductId: number | null = null;
  movements: InventoryMovement[] =[];
  searchTerm: string = '';
  sortField: string = 'code';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private productService: ProductService,
    private inventoryMovementService: InventoryMovementService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadInitialMovements();
  }

  changeSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'fa fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
  }

  loadProducts(): void {
    this.productService.getProducts(true).subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }

  loadInitialMovements(): void {
    this.inventoryMovementService.getDevolutionsAndAdujustments().subscribe({
      next: (res) => this.movements = res.data,
      error: (err) => console.error(err)
    })
  }

  onProductChange(): void {
    if (!this.selectedProductId) {
      this.loadInitialMovements();
      return;
    }

    this.inventoryMovementService.getByProduct(this.selectedProductId).subscribe({
      next: (res) => this.movements = res.data,
      error: (err) => console.error(err)
    });
  }

  trackByMovement(index: number, item: InventoryMovement): number {
    return item.id ?? index;
  }

}
