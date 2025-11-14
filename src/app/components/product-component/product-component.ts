import { Component, OnInit, ViewChild } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { ProductFormComponent } from '../forms/product-form-component/product-form';
import { BooleanToTextPipe } from '../../shared/pipes/boolean-to-text-pipe';
import { ProductRequestDto } from '../../models/product-request-dto';
import { NotificationService } from '../../services/notification.service';
import { StockFormComponent } from "../forms/stock-form-component/stock-form-component";
import { StokcRequestDto } from '../../models/stock-request-dto';
import { FilterByPipe } from '../../shared/pipes/filter-by-pipe';
import { HasRoleDirective } from '../../core/has-role.directive';
import { NgSelectComponent } from "@ng-select/ng-select";
import { Supplier } from '../../models/supplier';
import { SupplierService } from '../../services/supplier.service';
import { OrderByPipe } from '../../shared/pipes/order-by-pipe';

declare var $: any;

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    FormsModule,
    ProductFormComponent,
    StockFormComponent,
    FilterByPipe,
    HasRoleDirective,
    NgSelectComponent,
    OrderByPipe
],
  templateUrl: './product-component.html',
  styleUrl: './product-component.css'
})
export class ProductComponent implements OnInit {

  @ViewChild('productFormModal') productFormModal!: ProductFormComponent;
  @ViewChild('updateStockFormModal') updateStockFormModal!: StockFormComponent;

  private readonly IVA_RATE = 0.16; // 16%
  products: Product[] = [];
  suppliers: Supplier[] = [];
  selectedProduct: Product | null = null;
  selectedSupplierId: number | null = null;
  productForDetails: Product | null = null;
  searchTerm: string = '';
  profitPercentage: number = 0;
  costWithoutTaxes: number = 0;
  showActiveProducts: boolean = true;
  sortField: string = 'code';
  sortDirection: 'asc' | 'desc' = 'asc'; 

  constructor(
    private productService: ProductService,
    private supplierService: SupplierService, 
    private notify: NotificationService) {}

  ngOnInit(): void {
    this.showActiveProducts = true;
    this.selectedSupplierId = null;

    this.loadSuppliers();
    this.loadProducts();
  }

  onToggleChange(): void {
    this.loadProducts();
  }

  openCreateModal(): void {
    this.selectedProduct = null;
    this.productFormModal.resetFormAndModal();
    $('#productModal').modal('show');
  }

  openEditModal(product: Product) {
    this.selectedProduct = product;
    this.closeProductDetails();
    $('#productModal').modal('show');
  }

  openUpdateStockModal(product: Product) {
    this.selectedProduct = product;
    this.updateStockFormModal.resetFormAndModal();
    $('#updateStockModal').modal('show');
  }

  closeUpdateStockModal(): void {
    $('#updateStockModal').modal('hide');
  }

  closeProductForm(): void {
    $('#productModal').modal('hide');
  }

  viewProductDetails(product: Product): void {
    this.productForDetails = product;
    this.calculateProfitPercentage(this.productForDetails);
    this.calculateCostWitoutTaxes(this.productForDetails);
    $('#productDetailsModal').modal('show');
  }

  closeProductDetails(): void {
    $('#productDetailsModal').modal('hide');
  }

  calculateProfitPercentage(productForDetails: Product): void {
    if (productForDetails.cost && productForDetails.price) {
      const profitAmount = productForDetails.price - productForDetails.cost;
      this.profitPercentage = (profitAmount / productForDetails.cost) * 100;
    } else {
      this.profitPercentage = 0;
    }
  }

  calculateCostWitoutTaxes(productForDetails: Product): void {
    if (productForDetails.cost) {
      this.costWithoutTaxes = productForDetails.cost / (1 + this.IVA_RATE);
      this.costWithoutTaxes = parseFloat(this.costWithoutTaxes.toFixed(2));
    } else {
      this.costWithoutTaxes = 0;
    }
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers(true).subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error(err)
    });
  }

  loadProducts(): void {

    if (this.selectedSupplierId) {
      this.supplierService.getProductsBySupplier(this.selectedSupplierId, this.showActiveProducts).subscribe({
        next: (res) => {
          this.products = res.data ?? [];
        },
        error: (error) => {
          console.error('Error al obtener los productos:', error);
        }
      });
    } else {
      this.productService.getProducts(this.showActiveProducts).subscribe({
        next: (data) => {
          this.products = data ?? [];
        },
        error: (error) => {
          console.error('Error al obtener los productos:', error);
        }
      });
    }
  }

  onSupplierChange(supplierId: number | null): void {
    this.selectedSupplierId = supplierId;
    this.loadProducts();
  }

  onClearSupplier(): void {
    this.selectedSupplierId = null;
    this.loadProducts();
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

  onProductSaved(productRequestDto: ProductRequestDto): void {
    if (productRequestDto.id) {
      this.productService.updateProduct(productRequestDto.id, productRequestDto).subscribe({
        next: (res) => {
          this.loadProducts()
          this.notify.success('¡Producto actualizado!', res?.message);
          this.closeProductForm();
        }, 
        error(err) {
          console.log(err);
        }
      });
    } else {
      this.productService.createProduct(productRequestDto).subscribe({
        next: (res) => {
          this.loadProducts();
          this.notify.success('¡Producto agregado!', res?.message);
          this.closeProductForm()
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }

  updateStock(product: Product, stockRequestDto: StokcRequestDto): void {
    if (product.id) {
      this.productService.updateStock(product.id, stockRequestDto).subscribe({
        next: (res) => {
          this.loadProducts();
          this.notify.success("¡Stock actualizado!", res?.message);
          this.closeUpdateStockModal()
        },
        error(err) {
          console.error(err);
        }
      })
    }
  }

  desactivateProduct(product: Product): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres desactivar el producto "${product.name}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = product.id ?? 0;
          this.productService.desactivateProduct(id).subscribe({
            next: () => {
              this.loadProducts();
              this.notify.success('¡Producto desactivado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  activateProduct(product: Product): void {
    this.notify.confirm('¿Estás seguro?', `¿Quieres activar el producto "${product.name}"?`)
      .then((result) => {
        if (result.isConfirmed) {
          let id: number = product.id ?? 0;
          this.productService.activateProduct(id).subscribe({
            next: () => {
              this.loadProducts();
              this.notify.success('¡Producto activado!');
            },
            error(err) {
              console.error(err);
            }
          });
        }
      });
  }

  trackByProduct(index: number, item: Product): number {
    return item.id ?? index;
  }

}
