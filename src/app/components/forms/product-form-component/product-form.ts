import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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

function priceGteCost(group: AbstractControl): ValidationErrors | null {
  const cost = group.get('cost')?.value;
  const price = group.get('price')?.value;
  if (cost == null || price == null) return null;
  return Number(price) >= Number(cost) ? null : { priceLtCost: true };
}

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BsDropdownModule,
    NgSelectModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductFormComponent implements OnInit, OnChanges {

  @Input() product: Product | null = null;
  @Output() saveProduct = new EventEmitter<ProductRequestDto>();

  form!: FormGroup;
  suppliers: Supplier[] = [];
  subcategories: Subcategory[] = [];
  presentations: Presentation[] = [];

  private readonly IVA_RATE = 0.16; // 16%
  profitPercentage: number = 0;
  costWithoutTaxes: number = 0;

  constructor(
    private fb: FormBuilder,
    private supplierservice: SupplierService, 
    private subcategoryService: SubcategoryService, 
    private prsentationService: PresentationService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      minimumStock: [0, [Validators.required, Validators.min(0)]],
      recommendedStock: [0, [Validators.min(0)]],
      subcategoryId: [null],
      presentationId: [null],
      supplierIds: [[]] // array simple de IDs
    },
    { validators: priceGteCost }
  );

    this.getSubcategories();
    this.getPresentations();
    this.getSuppliers();

    // Observadores reactivos
    this.form.get('price')?.valueChanges.subscribe(() => this.onPriceChange());
    this.form.get('cost')?.valueChanges.subscribe(() => this.onCostChange());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      const p = changes['product'].currentValue as Product;
      this.form.patchValue({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        minimumStock: p.minimumStock,
        recommendedStock: p.recommendedStock,
        subcategoryId: p.subcategory?.id,
        presentationId: p.presentation?.id,
        supplierIds: p.suppliers?.map(s => s.id) ?? []
      });
      this.onCostChange();
      this.calculateProfitPercentage();
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: ProductRequestDto = this.form.value;
    this.saveProduct.emit(dto)
  }

  closeProductForm(): void {
    $('#productModal').modal('hide');
  }

  onPriceChange(): void {
    this.calculateProfitPercentage();
  }

  onProfitChange(): void {
    const cost = this.form.get('cost')?.value;
  
    if (cost && this.profitPercentage) {
      let price = cost + cost * (this.profitPercentage / 100);
      price = parseFloat(price.toFixed(2));
      this.form.get('price')?.setValue(price, { emitEvent: false });
    }
  }

  onCostWithoutTaxesChange(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.costWithoutTaxes = value || 0;
    if (this.costWithoutTaxes) {
      const cost = this.costWithoutTaxes * (1 + this.IVA_RATE);
      this.form.get('cost')?.setValue(parseFloat(cost.toFixed(2)), { emitEvent: true });
    }
  }

  onCostChange(): void {
    const cost = this.form.get('cost')?.value;

    if (cost) {
      this.costWithoutTaxes = parseFloat((cost / (1 + this.IVA_RATE)).toFixed(2));
      this.calculateProfitPercentage();
    } else {
      this.costWithoutTaxes = 0;
      this.form.get('price')?.setValue(0, { emitEvent: false });
      this.profitPercentage = 0;
    }
  }

  calculateProfitPercentage(): void {
    const cost = this.form.get('cost')?.value;
    const price = this.form.get('price')?.value;

    if (cost && price) {
      const profitAmount = price - cost;
      this.profitPercentage = parseFloat(((profitAmount / cost) * 100).toFixed(2));
    } else {
      this.profitPercentage = 0;
    }
  }

  calculateCostWitoutTaxes(): void {
    const cost = this.form.get('cost')?.value;
    this.costWithoutTaxes = cost ? parseFloat((cost / (1 + this.IVA_RATE)).toFixed(2)) : 0;
  }

  resetFormAndModal(): void {
    this.form.reset({
      id: null,
      name: '',
      code: '',
      description: '',
      price: 0,
      cost: 0,
      stock: 0,
      minimumStock: 0,
      recommendedStock: 0,
      subcategoryId: null,
      presentationId: null,
      supplierIds: []
    });
    this.profitPercentage = 0;
    this.costWithoutTaxes = 0;
  }

  c(name: string) {
    return this.form.get(name)!;
  }

}
