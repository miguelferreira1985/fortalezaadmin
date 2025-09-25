import { CommonModule } from '@angular/common';
import { Comment } from '@angular/compiler';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Supplier } from '../../../models/supplier';

declare var $: any;

@Component({
  selector: 'app-supplier-form-component',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './supplier-form-component.html',
  styleUrl: './supplier-form-component.css'
})
export class SupplierFormComponent {

  @Input() supplier: Supplier | null = null;
  @Output() saveSupplier = new EventEmitter<Supplier>();
  @ViewChild('supplierForm') supplierForm!: NgForm;

  formSupplier: Supplier = { 
    name: '', 
    contact: '', 
    contactPhone: '', 
    officePhone: '', 
    email: '', 
    address: ''
  };

  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplier'] && changes['supplier'].currentValue) {
      // El valor del input `product` ha cambiado, es el momento de cargar los datos
      this.formSupplier = { ...changes['supplier'].currentValue };
      console.log('Supplier data loaded:', this.formSupplier);
    } else if (changes['supplier'] && !changes['supplier'].currentValue) {
      console.log('Form reset for new supplier.');
    }
  }

  onSubmit(): void {
    this.saveSupplier.emit(this.formSupplier);
  }

  closeSupplierForm(): void {
    $('#supplierModal').modal('hide');
  }

  public resetFormAndModal(): void {
    this.formSupplier = { 
      name: '', 
      contact: '', 
      contactPhone: '', 
      officePhone: '', 
      email: '', 
      address: ''
    };

    setTimeout(() => {
      if (this.supplierForm) {
        this.supplierForm.resetForm(this.formSupplier);
        console.log('Formulario Reseteado');
      }
    });
  }

}
