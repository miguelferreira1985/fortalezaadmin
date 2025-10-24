import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { Product } from '../../../models/product';
import { Supplier } from '../../../models/supplier';
import { SupplierService } from '../../../services/supplier.service';
import { Subcategory } from '../../../models/subcategory';
import { SubcategoryService } from '../../../services/subcategory.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { PresentationService } from '../../../services/presentation.service';
import { Presentation } from '../../../models/presentation';
import { ProductRequestDto } from '../../../models/product-request-dto';
import { CustomValidators } from '../../../custom-validators';

declare var $: any;

type SupplierOption = Supplier & { disabled?: boolean };

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  private suppliersLoaded = false;
  private pendingProduct: Product | null = null;

  profitPercentage: number = 0;
  costWithoutTaxes: number = 0;

  constructor(
    private fb: FormBuilder,
    private supplierservice: SupplierService,
    private subcategoryService: SubcategoryService,
    private presentationService: PresentationService) {}

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
      supplierCosts: this.fb.array([], this.uniqueSuppliersValidator)
    }, { validators: CustomValidators.priceGteCost });

    this.getSubcategories();
    this.getPresentations();
    this.getSuppliers();

    this.form.get('cost')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => { if (!this.updating) this.syncFromCostWithTaxes(); });

    this.form.get('price')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => { if (!this.updating) this.syncFromPrice(); });

    this.supplierCosts.valueChanges.subscribe(() => this.calculateAverageCost());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      const product = changes['product'].currentValue as Product;

      if (!this.suppliersLoaded) {
        this.pendingProduct = product;
        return;
      }
      this.applyProduct(product);
    }
  }

  get supplierCosts(): FormArray {
    return this.form.get('supplierCosts') as FormArray;
  }

  c(name: string) { return this.form.get(name)!; }

  closeProductForm(): void { $('#productModal').modal('hide'); }

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
      presentationId: null
    });
    this.supplierCosts.clear();
    this.profitPercentage = 0;
    this.costWithoutTaxes = 0;
  }

  addSupplierRow(): void { this.supplierCosts.push(this.createSupplierRow()); }

  removeSupplierRow(index: number): void {
    this.supplierCosts.removeAt(index);
    this.calculateAverageCost();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const suppliersForApi = (this.supplierCosts.controls || [])
    .map(g => ({
      supplierId: g.get('supplierId')?.value,
      cost: Number(g.get('supplierCostWithTaxes')?.value || 0),
      discount: Number(g.get('discount')?.value || 0)
    }))
    .filter(s => s.supplierId && s.cost > 0);

    const dto: ProductRequestDto = {
      ...this.form.value,
      supplierCosts: suppliersForApi
    };

    this.saveProduct.emit(dto);
  }

  onCostWithoutTaxesChange(event: Event): void {
    if (this.updating) return;
    this.updating = true;

    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.costWithoutTaxes = value;

    const costWithIva = this.round2(this.costWithoutTaxes * (1 + this.IVA_RATE));
    this.form.get('cost')?.setValue(costWithIva, { emitEvent: false });

    if (this.profitPercentage === 0) {
      this.form.get('price')?.setValue(costWithIva, { emitEvent: false });
    } else {
      const newPrice = this.round2(costWithIva * (1 + this.profitPercentage / 100));
      this.form.get('price')?.setValue(newPrice, { emitEvent: false });
    }

    this.calculateProfitPercentage();
    this.updating = false;
  }

  onProfitChange(): void {
    if (this.updating) return;
    this.updating = true;

    const cost = Number(this.form.get('cost')?.value) || 0;
    const profit = Number(this.profitPercentage) || 0;

    if (cost > 0) {
      if (profit === 0) {
        this.form.get('price')?.setValue(cost, { emitEvent: false });
      } else {
        const newPrice = cost * (1 + profit / 100);
        this.form.get('price')?.setValue(+this.round2(newPrice), { emitEvent: false });
      }
    }
    this.calculateProfitPercentage();
    this.updating = false;
  }

  private getSuppliers(): void {
    this.supplierservice.getSuppliers().subscribe(data => {
      this.suppliers = (data || []).map(s => ({ ...s, id: Number(s.id) }));
      this.suppliersLoaded = true;

      if (this.pendingProduct) {
        this.applyProduct(this.pendingProduct);
        this.pendingProduct = null;
      }
    });
  }

  private getSubcategories(): void {
    this.subcategoryService.getSubcategories().subscribe(data => {
      this.subcategories = data;
    });
  }

  private getPresentations(): void {
    this.presentationService.getAllPresentations().subscribe(data => {
      this.presentations = data;
    });
  }

  private syncFromCostWithTaxes(): void {
    const cost = Number(this.form.get('cost')?.value) || 0;
    this.costWithoutTaxes = cost > 0 ? this.round2(cost / (1 + this.IVA_RATE)) : 0;

    if (this.profitPercentage === 0) {
      this.form.get('price')?.setValue(cost, { emitEvent: false });
    } else {
      const newPrice = this.round2(cost * (1 + this.profitPercentage / 100));
      this.form.get('price')?.setValue(newPrice, { emitEvent: false });
    }

    this.calculateProfitPercentage();
  }

  private syncFromPrice(): void {
    const price = Number(this.form.get('price')?.value) || 0;
    const cost = Number(this.form.get('cost')?.value) || 0;
    if (cost > 0 && price > 0) {
      this.profitPercentage = this.round2(((price - cost) / cost) * 100);
    } else if (price === 0) {
      this.profitPercentage = 0;
    }
  }

  private calculateProfitPercentage(): void {
    const cost = Number(this.form.get('cost')?.value) || 0;
    const price = Number(this.form.get('price')?.value) || 0;
    if (cost > 0 && price > 0) {
      this.profitPercentage = this.round2(((price - cost) / cost) * 100);
    } else if (price === cost) {
      this.profitPercentage = 0;
    }
  }

  private calculateAverageCost(): void {
    if (this.updating) return;

    const rows = (this.supplierCosts.controls || []).map(g => ({
      supplierId: g.get('supplierId')?.value,
      withTaxes: Number(g.get('supplierCostWithTaxes')?.value ?? 0),
      discount: Number(g.get('discount')?.value ?? 0)
    }));

    const effectiveCosts = rows
      .filter(r => r.supplierId && r.withTaxes > 0)
      .map(r => {
        const d = isFinite(r.discount) ? Math.max(0, r.discount) : 0;
        const eff = r.withTaxes * (1 - d / 100);
        return eff > 0 ? eff : 0;
      });

    if (effectiveCosts.length === 0) return;

    const avg = effectiveCosts.reduce((a, b) => a + b, 0) / effectiveCosts.length;
    const avg2 = this.round2(avg);

    this.updating = true;
    this.form.get('cost')?.setValue(avg2, { emitEvent: false });
    this.costWithoutTaxes = this.round2(avg2 / (1 + this.IVA_RATE));
    const profit = Number(this.profitPercentage) || 0;

    if (profit <= 0) {
      this.form.get('price')?.setValue(avg2, { emitEvent: false });
      this.profitPercentage = 0;
    } else {
      const newPrice = this.round2(avg2 * (1 + profit / 100));
      this.form.get('price')?.setValue(newPrice, { emitEvent: false });
    }

    this.calculateProfitPercentage();

    this.updating = false;
  }

  private applyProduct(p: Product) {
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
      presentationId: p.presentation?.id
    }, { emitEvent: false });

    const rows = (p.supplierCosts ?? []).map((sc: any) => {
      const supplierId = Number(sc.supplierId ?? sc.supplier?.id ?? null);
      const withTaxes = Number(sc.cost) || 0;
      const withoutTaxes = withTaxes > 0 ? this.round2(withTaxes / (1 + this.IVA_RATE)) : 0;
      const discount = Number(sc.discount) || 0;
      return this.createSupplierRow({ supplierId, withTaxes, withoutTaxes, discount });
    });

    const fa = this.fb.array(rows, this.uniqueSuppliersValidator);
    this.form.setControl('supplierCosts', fa);
    fa.updateValueAndValidity({ emitEvent: false });

    this.costWithoutTaxes = p.cost ? this.round2(Number(p.cost) / (1 + this.IVA_RATE)) : 0;
    this.profitPercentage = (p.price && p.cost) ? this.round2(((Number(p.price) - Number(p.cost)) / Number(p.cost)) * 100) : 0;
    
    this.updating = false;
    this.calculateAverageCost();
  }

  private createSupplierRow(init?: {
    supplierId?: number | null;
    withTaxes?: number;
    withoutTaxes?: number;
    discount?: number;
  }): FormGroup {
    const row = this.fb.group({
      supplierId: [init?.supplierId ?? null],
      supplierCostWithoutTaxes: [{ value: init?.withoutTaxes ?? 0, disabled: !init?.supplierId }],
      supplierCostWithTaxes:   [{ value: init?.withTaxes ?? 0,   disabled: !init?.supplierId }],
      discount:                [{ value: init?.discount ?? 0,    disabled: !init?.supplierId }]
    });
  
    let localUpdating = false;
  
    row.get('supplierCostWithoutTaxes')?.valueChanges.subscribe(v => {
      if (localUpdating) return;
      localUpdating = true;
      const val = Number(v) || 0;
      row.get('supplierCostWithTaxes')?.setValue(this.round2(val * (1 + this.IVA_RATE)), { emitEvent: false });
      localUpdating = false;
      this.calculateAverageCost();
    });
  
    row.get('supplierCostWithTaxes')?.valueChanges.subscribe(v => {
      if (localUpdating) return;
      localUpdating = true;
      const val = Number(v) || 0;
      row.get('supplierCostWithoutTaxes')?.setValue(val > 0 ? this.round2(val / (1 + this.IVA_RATE)) : 0, { emitEvent: false });
      localUpdating = false;
      this.calculateAverageCost();
    });
  
    row.get('discount')?.valueChanges.subscribe(() => this.calculateAverageCost());
  
    const toggleRow = (enabled: boolean) => {
      const fields = ['supplierCostWithoutTaxes','supplierCostWithTaxes','discount'] as const;
      for (const f of fields) {
        const ctrl = row.get(f)!;
        enabled ? ctrl.enable({ emitEvent: false }) : ctrl.disable({ emitEvent: false });
      }
      const costCtrl = row.get('supplierCostWithTaxes')!;
      if (enabled) {
        costCtrl.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        costCtrl.clearValidators();
        row.get('supplierCostWithoutTaxes')?.setValue(0, { emitEvent: false });
        row.get('supplierCostWithTaxes')?.setValue(0, { emitEvent: false });
        row.get('discount')?.setValue(0, { emitEvent: false });
      }
      costCtrl.updateValueAndValidity({ emitEvent: false });
    };
  
    toggleRow(!!init?.supplierId);
  
    row.get('supplierId')?.valueChanges.subscribe(val => {
      const picked = Number(val || 0);
  
      if (picked > 0 && this.isDuplicateSupplierForRow(row, picked)) {
        row.get('supplierId')?.setValue(null, { emitEvent: false });
        toggleRow(false);
        return;
      }
  
      toggleRow(!!picked);
    });
  
    return row;
  }

  private isDuplicateSupplierForRow(row: AbstractControl, supplierId: number): boolean {
    if (!supplierId) return false;
    const picked = Number(supplierId);
    return this.supplierCosts.controls.some(ctrl =>
      ctrl !== row && Number(ctrl.get('supplierId')?.value || 0) === picked
    );
  }

  private uniqueSuppliersValidator = (fa: AbstractControl): ValidationErrors | null => {
    const arr = fa as FormArray;
    const ids = arr.controls
      .map(c => c.get('supplierId')?.value)
      .filter((v: number | null) => v != null);

    const uniq = new Set(ids);
    return uniq.size !== ids.length ? { duplicateSuppliers: true } : null;
  }

  private round2(n: number) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  trackByIndex = (_: number, __: any) => _;

  compareById = (a: number | string | null, b: number | string | null) =>
    a != null && b != null && Number(a) === Number(b);

  availableSuppliers(rowIndex: number): SupplierOption[] {
    const taken = new Set(
      (this.supplierCosts.controls || [])
        .map((g, idx) => idx === rowIndex ? null : g.get('supplierId')?.value)
        .filter((v): v is number | string => v != null)
        .map(v => Number(v))
    );
    const currentId = Number(this.supplierCosts.at(rowIndex).get('supplierId')?.value ?? NaN);

    return this.suppliers.filter(s => {
      const id = Number(s.id);
      return id === currentId || !taken.has(id);
    });
  }

  onSupplierPicked(row: number): void {
    const rowGroup = this.supplierCosts.at(row) as FormGroup | undefined;
    if (!rowGroup) return;
  
    const ctrl = rowGroup.get('supplierId');
    const picked = Number(ctrl?.value ?? 0);
    if (!picked) return;
  
    if (this.selectedSupplierIds(row).includes(picked)) {
      if (ctrl) ctrl.setValue(null, { emitEvent: false });
      return;
    }
  
    const fieldNames = ['supplierCostWithoutTaxes', 'supplierCostWithTaxes', 'discount'] as const;
    for (const name of fieldNames) {
      rowGroup.get(name)?.enable({ emitEvent: false });
    }
  }
  
  private selectedSupplierIds(excludeIndex: number = -1): number[] {
    return (this.supplierCosts.controls || [])
      .map((g, idx) => idx === excludeIndex ? null : Number(g.get('supplierId')?.value ?? 0))
      .filter((v): v is number => !!v);
  }
  
}
