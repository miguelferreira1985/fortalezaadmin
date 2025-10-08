import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { CustomValidators } from '../../../custom-validators';
import { debounceTime, distinctUntilChanged } from 'rxjs';

declare var $: any;

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
  private updating = false;
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
    { validators: CustomValidators.priceGteCost }
  );

    this.getSubcategories();
    this.getPresentations();
    this.getSuppliers();

  this.form.get('cost')?.valueChanges
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe(() => {
      if (!this.updating) this.syncFromCostWithTaxes();
    });

  this.form.get('price')?.valueChanges
    .pipe(debounceTime(500), distinctUntilChanged())
    .subscribe(() => {
      if (!this.updating) this.syncFromPrice();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      console.log('🔄 Cargando producto en formulario:', changes['product'].currentValue);
      const p = changes['product'].currentValue as Product;
  
      this.updating = true;
  
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
      }, { emitEvent: false });
  
      this.costWithoutTaxes = p.cost
        ? parseFloat((p.cost / (1 + this.IVA_RATE)).toFixed(2))
        : 0;
  
      if (p.price && p.cost) {
        const profit = ((p.price - p.cost) / p.cost) * 100;
        this.profitPercentage = parseFloat(profit.toFixed(2));
      } else {
        this.profitPercentage = 0;
      }
  
      this.updating = false;
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
    const dto: ProductRequestDto = { ...this.form.value }
    console.log("Form para guardar: ", this.form.value); 
    console.log("Producto para guardar: ", dto); 
    this.saveProduct.emit(dto)
  }

  closeProductForm(): void {
    $('#productModal').modal('hide');
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


  onCostWithoutTaxesChange(event: Event): void {
    if (this.updating) return;
    this.updating = true;

    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.costWithoutTaxes = value;

    const costWithIva = this.costWithoutTaxes * (1 + this.IVA_RATE);
    this.form.get('cost')?.setValue(+costWithIva.toFixed(2), { emitEvent: false });

    let newPrice = costWithIva;
    if (this.profitPercentage > 0) {
      newPrice = costWithIva * (1 + this.profitPercentage / 100);
    }

    this.form.get('price')?.setValue(+newPrice.toFixed(2), { emitEvent: false });
    this.calculateProfitPercentage();

    this.updating = false;
  }

  onProfitChange(): void {
    if (this.updating) return;
    this.updating = true;
  
    const cost = Number(this.form.get('cost')?.value) || 0;
    const profit = Number(this.profitPercentage) || 0;
  
    if (cost > 0) {
      const newPrice = cost * (1 + profit / 100);
      this.form.get('price')?.setValue(+newPrice.toFixed(2), { emitEvent: false });
    }
  
    this.calculateProfitPercentage();
    this.updating = false;
  }
  
  syncFromCostWithTaxes(): void {
    if (this.updating) return;
    this.updating = true;
  
    const cost = Number(this.form.get('cost')?.value) || 0;
    this.costWithoutTaxes = cost > 0 ? +(cost / (1 + this.IVA_RATE)).toFixed(2) : 0;
  
    const profit = Number(this.profitPercentage) || 0;
    const newPrice =
      profit > 0 ? cost * (1 + profit / 100) : cost;
  
    this.form.get('price')?.setValue(+newPrice.toFixed(2), { emitEvent: false });
    this.calculateProfitPercentage();
  
    this.updating = false;
  }
  
  syncFromPrice(): void {
    if (this.updating) return;
    this.updating = true;
  
    const price = Number(this.form.get('price')?.value) || 0;
    let cost = Number(this.form.get('cost')?.value) || 0;
    const profit = Number(this.profitPercentage) || 0;
  
    if (price > 0 && cost === 0) {
      if (profit > 0) {
        cost = price / (1 + profit / 100);
      } else {
        cost = price; 
      }
      this.form.get('cost')?.setValue(+cost.toFixed(2), { emitEvent: false });
    }
  
    this.costWithoutTaxes = cost > 0 ? +(cost / (1 + this.IVA_RATE)).toFixed(2) : 0;
  
    if (cost > 0 && price > 0) {
      const profitCalc = ((price - cost) / cost) * 100;
      this.profitPercentage = +profitCalc.toFixed(2);
    } else {
      this.profitPercentage = 0;
    }
  
    console.log(`[syncFromPrice] Precio: ${price}, Costo calculado: ${cost}, Ganancia: ${this.profitPercentage}`);
  
    this.updating = false;
  }

  calculateProfitPercentage(): void {
    const cost = Number(this.form.get('cost')?.value) || 0;
    const price = Number(this.form.get('price')?.value) || 0;

    if (cost > 0 && price > 0) {
      this.profitPercentage = +(((price - cost) / cost) * 100).toFixed(2);
    } else {
      this.profitPercentage = 0;
    }
  }

}
