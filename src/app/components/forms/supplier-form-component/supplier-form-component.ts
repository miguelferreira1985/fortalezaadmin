import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supplier } from '../../../models/supplier';

declare var $: any;

@Component({
  selector: 'app-supplier-form-component',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './supplier-form-component.html'
})
export class SupplierFormComponent {

  @Input() supplier: Supplier | null = null;
  @Output() saveSupplier = new EventEmitter<Supplier>();

form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      contact: ['', Validators.required],
      location: ['', Validators.required],
      email: ['', Validators.email],
      contactPhone: ['', Validators.required],
      officePhone: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplier'] && changes['supplier'].currentValue) {
      const s = changes['supplier'].currentValue as Supplier;
      this.form.patchValue({
        id: s.id,
        name: s.name,
        contact: s.contact,
        location: s.location,
        email: s.email,
        contactPhone: s.contactPhone,
        officePhone: s.officePhone
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const supplier: Supplier = this.form.value;
    this.saveSupplier.emit(supplier);
  }

  closeSupplierForm(): void {
    $('#supplierModal').modal('hide');
  }

  resetFormAndModal(): void {
    this.form.reset({
      id: null,
      name: '',
      contact: '',
      location: '',
      email: '',
      contactPhone: '',
      officePhone: ''
    });
  }

  c(name: string) {
    return this.form.get(name)!;
  }

}
