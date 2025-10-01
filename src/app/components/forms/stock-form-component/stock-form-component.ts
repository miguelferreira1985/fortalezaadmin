import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Product } from '../../../models/product';
import { StokcRequestDto } from '../../../models/stock-request-dto';
import { CustomValidators } from '../../../custom-validators';

declare var $: any;

@Component({
  selector: 'app-stock-form-component',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './stock-form-component.html',
  styleUrl: './stock-form-component.css'
})
export class StockFormComponent implements OnInit, OnChanges {

  @Input() product: Product | null = null;
  @Output() saveStock = new EventEmitter<StokcRequestDto>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        previousStock: [{ value: 0, disabled: true }],            
        quantity: [0, [Validators.required, CustomValidators.nonZeroQuantity]],                      
        newStock: [{ value: 0, disabled: true }],
        description: ['', Validators.required]                   
      },
      { validators: CustomValidators.nonNegativeStock }                   
    );

    // Actualiza newStock en vivo cuando se escribe quantity
    this.form.get('quantity')?.valueChanges.subscribe(qty => {
      const prev = Number(this.form.get('previousStock')?.value ?? 0);
      const q = Number(qty ?? 0);
      this.form.get('newStock')?.setValue(prev + q, { emitEvent: false });

      // Re-evalúa el validador del grupo
      this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product && this.form) {
      const prev = Number(this.product.stock ?? 0);
      this.form.patchValue({
        previousStock: prev,
        quantity: 0,
        newStock: prev
      }, { emitEvent: false });

      // Re-evalúa con los nuevos valores
      this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: StokcRequestDto = { 
      quantity: Number(this.form.get('quantity')?.value),
      description: this.form.get('description')?.value 
    };
    this.saveStock.emit(dto);
  }

  resetFormAndModal(): void {
    this.form.reset({
      previousStock: this.product?.stock ?? 0,
      quantity: 0,
      newStock: this.product?.stock ?? 0,
      description: ''
    });
  }

  c(name: string) {
    return this.form.get(name)!;
  }

  closeUpdateStockModal(): void {
    $('#updateStockModal').modal('hide');
  }

}
