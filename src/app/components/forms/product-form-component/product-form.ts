import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Product } from '../../../models/product';
import { Supplier } from '../../../models/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Subcategory } from '../../../models/subcategory';
import { SubcategoryService } from '../../../services/subcategory.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { PresentationService } from '../../../services/presentation.service';
import { Presentation } from '../../../models/presentation';
import { ProductRequestDto } from '../../../models/product-request-dto';

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
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Output() saveProduct = new EventEmitter<ProductRequestDto>();
  @ViewChild('productForm') productForm!: NgForm;

  private readonly IVA_RATE = 0.16; // 16%
  profitPercentage: number = 0;
  costWithoutTaxes: number = 0;
  formProduct: Product = { 
    name: '', 
    code: '', 
    description: '', 
    price: 0, 
    cost: 0, 
    stock: 0, 
    minimumStock: 0, 
    recommendedStock: 0, 
    subcategory: { id: 0, name: '', category: { id: 0, name: '' } },
    presentation: { id: 0, name: '', abbreviation: '' },
    suppliers: [] 
  };
  suppliers: Supplier[] = [];
  subcategories: Subcategory[] = [];
  presentations: Presentation[] = [];
  selectedSupplierIds: number[] = [];

  constructor(
    private supplierservice: SupplierService, 
    private subcategoryService: SubcategoryService, 
    private prsentationService: PresentationService) {}

  ngOnInit(): void {
    this.getSubcategories();
    this.getPresentations();
    this.getSuppliers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      // El valor del input `product` ha cambiado, es el momento de cargar los datos
      this.formProduct = { ...changes['product'].currentValue };
      this.selectedSupplierIds = (this.formProduct.suppliers || [])
      .filter(s => s.id !== undefined)
      .map(s => s.id as number);
      this.calculateProfitPercentage();
      this.calculateCostWitoutTaxes();
      console.log('Product data loaded:', this.formProduct);
    } else if (changes['product'] && !changes['product'].currentValue) {
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
    },);
  }

  getPresentations(): void {
    this.prsentationService.getAllPresentations().subscribe(data => {
      this.presentations = data;
    });
  }

  onSubmit(): void {
    const productToSave: ProductRequestDto = {
      id: this.formProduct.id,
      name: this.formProduct.name,
      code: this.formProduct.code,
      description: this.formProduct.description,
      price: this.formProduct.price,
      cost: this.formProduct.cost,
      stock: this.formProduct.stock,
      minimumStock: this.formProduct.minimumStock,
      recommendedStock: this.formProduct.recommendedStock,
      subcategoryId: this.formProduct.subcategory.id,
      presentationId: this.formProduct.presentation.id,
      supplierIds: this.selectedSupplierIds,
    }
    console.log("Producto desde form:" + productToSave);
    this.saveProduct.emit(productToSave);
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
      this.formProduct.price = parseFloat(this.formProduct.price.toFixed(2));
    }
  }

  onCostWithoutTaxesChange(): void {
    if (this.costWithoutTaxes) {
      const taxes = this.costWithoutTaxes * this.IVA_RATE;
      this.formProduct.cost = this.costWithoutTaxes + taxes;
      this.formProduct.cost = parseFloat(this.formProduct.cost.toFixed(2));
    } else {
      this.formProduct.cost = 0;
      this.formProduct.price = 0;
      this.profitPercentage = 0;
    }
    this.onCostChange();
  }

  onCostChange(): void {
    if (this.formProduct.cost) {
      this.costWithoutTaxes = this.formProduct.cost / (1 + this.IVA_RATE);
      this.costWithoutTaxes = parseFloat(this.costWithoutTaxes.toFixed(2));
      console.log("Costo sin IVA:" + this.costWithoutTaxes)
    } else {
      this.costWithoutTaxes = 0;
      this.formProduct.price = 0;
      this.profitPercentage = 0;
    }
    this.onProfitChange();
    this.onPriceChange();
  }

  calculateProfitPercentage(): void {
    if (this.formProduct.cost && this.formProduct.price) {
      const profitAmount = this.formProduct.price - this.formProduct.cost;
      const calculatePercentage = (profitAmount / this.formProduct.cost) * 100;
      this.profitPercentage = parseFloat(calculatePercentage.toFixed(2));
      console.log("Costo con IVA:" + this.formProduct.cost)
    } else {
      this.profitPercentage = 0;
    }
  }

  calculateCostWitoutTaxes(): void {
    if (this.formProduct.cost) {
      this.costWithoutTaxes = this.formProduct.cost / (1 + this.IVA_RATE);
      this.costWithoutTaxes = parseFloat(this.costWithoutTaxes.toFixed(2));
    } else {
      this.costWithoutTaxes = 0;
    }
  }

  public resetFormAndModal(): void {
    this.formProduct = { 
      name: '', 
      code: '', 
      description: '', 
      price: 0, 
      cost: 0, 
      stock: 0, 
      minimumStock: 0, 
      recommendedStock: 0, 
      subcategory: { id: 0, name: '', category: { id: 0, name: '' } }, 
      presentation: { id: 0, name: '', abbreviation: '' },
      suppliers: [] 
    };
    this.profitPercentage = 0;
    this.selectedSupplierIds = [];

    setTimeout(() => {
      if (this.productForm) {
        this.productForm.resetForm(this.formProduct);
        console.log('Formulario Reseteado');
      }
    });
  }

}
