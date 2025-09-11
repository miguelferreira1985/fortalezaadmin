import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product';
import { Supplier } from '../../../models/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Subcategory } from '../../../models/subcategory';
import { SubcategoryService } from '../../../services/subcategory.service';
import { NgSelectModule } from '@ng-select/ng-select';

declare var $: any;

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule,
    NgSelectModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductFormComponent implements OnInit {
  @Input() product: Product | null = null;
  @Output() saveProduct = new EventEmitter<Product>();

  profitPercentage: number = 0;
  formProduct: Product = { name: '', code: '', description: '', price: 0, cost: 0, stock: 0, minimumStock: 0, recommendedStock: 0, subcategoryId: 0, supplierIds: [] };
  suppliers: Supplier[] = [];
  subcategories: Subcategory[] = [];
  selectedSupplierIds: number[] = [];

  constructor(private supplierservice: SupplierService, private subcategoryService: SubcategoryService) {}

  ngOnInit(): void {
    this.getSubcategories();
    this.getSuppliers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      // El valor del input `product` ha cambiado, es el momento de cargar los datos
      this.formProduct = { ...changes['product'].currentValue };
      this.selectedSupplierIds = this.formProduct.supplierIds || [];
      this.calculateProfitPercentage();
      console.log('Product data loaded:', this.formProduct);
    } else if (changes['product'] && !changes['product'].currentValue) {
      // El valor del input `product` es null, reseteamos el formulario
      this.formProduct = { name: '', code: '', description: '', price: 0, cost: 0, stock: 0, minimumStock: 0, recommendedStock: 0, subcategoryId: 0, supplierIds: [] };
      this.profitPercentage = 0;
      this.selectedSupplierIds = [];
      console.log('Form reset for new product.');
    }
  }

  getSuppliers(): void {
    this.supplierservice.getSuppliers().subscribe(data => {
      this.suppliers = data;
    });
  }

  getSubcategories(): void {
    this.subcategoryService.getSubcategories().subscribe(data => {
      this.subcategories = data;
    });
  }

  onSubmit(): void {
    this.formProduct.supplierIds = this.selectedSupplierIds;
    this.saveProduct.emit(this.formProduct);
  }

  closeProductForm(): void {
    $('#productModal').modal('hide');
  }

  onSupplierSelectionChange(id: number, isCheked: boolean): void {
    if (isCheked) {
      this.selectedSupplierIds.push(id);
    } else {
      const index = this.selectedSupplierIds.indexOf(id);
      if (index > -1) {
        this.selectedSupplierIds.splice(index, 1);
      }
    }
  }

  onPriceChange(): void {
    if(this.formProduct.cost && this.formProduct.price) {
      const profitAmount = this.formProduct.price - this.formProduct.cost;
      const calculatePercentage = (profitAmount / this.formProduct.cost) * 100;
      this.profitPercentage = parseFloat(calculatePercentage.toFixed(2));
    }
  }

  onProfitChange(): void {
    if(this.formProduct.cost && this.profitPercentage) {
      const profitAmount = this.formProduct.cost * (this.profitPercentage / 100);
      this.formProduct.price = this.formProduct.cost + profitAmount;
    }
  }

  onCostChange(): void {
    this.onProfitChange();
    this.onPriceChange();
  }

  calculateProfitPercentage(): void {
    if (this.formProduct.cost && this.formProduct.price) {
      const profitAmount = this.formProduct.price - this.formProduct.cost;
      const calculatePercentage = (profitAmount / this.formProduct.cost) * 100;
      this.profitPercentage = parseFloat(calculatePercentage.toFixed(2));
    } else {
      this.profitPercentage = 0;
    }
  }

}
