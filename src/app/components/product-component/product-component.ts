import { Component, OnInit, ViewChild } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { ProductFormComponent } from '../forms/product-form-component/product-form';
import { BooleanToTextPipe } from '../../pipes/booelean-to-text-pipe';
import { ProductRequestDto } from '../../models/product-request-dto';
import { NotificationService } from '../../core/notification.service';

declare var $: any;

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    FormsModule, 
    ProductFormComponent, 
    BooleanToTextPipe
  ],
  templateUrl: './product-component.html',
  styleUrl: './product-component.css'
})
export class ProductComponent implements OnInit {

  @ViewChild('productFormModal') productFormModal!: ProductFormComponent;

  private readonly IVA_RATE = 0.16; // 16%
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  productForDetails: Product | null = null;
  searchTerm: string = '';
  profitPercentage: number = 0;
  costWithoutTaxes: number = 0;
  showActiveProducts: boolean = true;

  constructor(private productService: ProductService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.getProducts();
  }

  onToggleChange(): void {
    this.getProducts();
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

  getProducts(): void {
    this.productService.getProducts(this.showActiveProducts).subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products];
        console.log('Productos obtenidos:', this.filteredProducts);
      },
      error: (error) => {
        console.error('Error al obtener los productos:', error);
      }
    });
  }

  filterProducts(): void {
    if (!this.searchTerm) {
      this.filteredProducts = [...this.products];
    } else {
      const lowerCaseSearchItem = this.searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(product => 
        product.code.toLowerCase().includes(lowerCaseSearchItem) ||
        product.name.toLowerCase().includes(lowerCaseSearchItem) 
      );
    }
  }

  onProductSaved(productRequestDto: ProductRequestDto): void {
    if (productRequestDto.id) {
      this.productService.updateProduct(productRequestDto.id, productRequestDto).subscribe({
        next: (res) => {
          this.getProducts()
          this.notify.toastSuccess(res?.message);
          $('#productModal').modal('hide');
        }, 
        error(err) {
          console.log(err);
        }
      });
    } else {
      console.log("Producto para crear:" + productRequestDto)
      this.productService.createProduct(productRequestDto).subscribe({
        next: (res) => {
          this.getProducts();
          this.notify.toastSuccess(res?.message);
          $('#productModal').modal('hide');
        },
        error(err) {
          console.error(err);
        }
      });
    }
  }

  desactivateProdutc(product: Product): void {

    this.notify.confirm('Estás seguro?', `Quieres desactivar el producto "${product.name}"`)
    .then((result) => {
      if (result.isConfirmed) {
        let id: number = product.id ?? 0;
        this.productService.desactivateProduct(id).subscribe({
          next: () => {
            this.getProducts();
            this.notify.toastSuccess("Producto desactivado");
          },
          error(err) {
            console.error(err);
          }
        });
      }
    });
  }

  activateProdutc(product: Product): void {

    this.notify.confirm('Estás seguro?', `Quieres activar el producto "${product.name}"`)
    .then((result) => {
      if (result.isConfirmed) {
        let id: number = product.id ?? 0;
        this.productService.activateProduct(id).subscribe({
          next: () => {
            this.getProducts();
            this.notify.toastSuccess("Producto activado");
          },
          error(err) {
            console.error(err);
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    this.notify.confirm('Estás seguro?', `Quieres eliminar el producto "${product.name}, esta accció es irreversible."`)
    .then((result) => {
      if (result.isConfirmed) {
        let id: number = product.id ?? 0;
        this.productService.deleteProduct(id).subscribe({
          next: (res) => {
            this.getProducts();
            this.notify.toastSuccess(res?.message); // ✅
          },
          error(err) {
            console.error(err);
          }
        });
      }
    });
  }

}
