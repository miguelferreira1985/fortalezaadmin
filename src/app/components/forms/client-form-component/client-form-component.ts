import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Client } from '../../../models/client';

declare var $: any;

@Component({
  selector: 'app-client-form-component',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './client-form-component.html',
  styleUrl: './client-form-component.css'
})
export class ClientFormComponent implements OnInit {

  @Input() client: Client | null = null;
  @Output() saveClient = new EventEmitter<Client>();
  @ViewChild('clientForm') clientForm!: NgForm;

  formClient: Client = { 
    companyName: '', 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    address: '', 
    rfc: '' 
  };

  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && changes['client'].currentValue) {
      // El valor del input `product` ha cambiado, es el momento de cargar los datos
      this.formClient = { ...changes['client'].currentValue };
      console.log('Client data loaded:', this.formClient);
    } else if (changes['client'] && !changes['client'].currentValue) {
      console.log('Form reset for new client.');
    }
  }

  onSubmit(): void {
    this.saveClient.emit(this.formClient);
  }

  closeClientForm(): void {
    $('#clientModal').modal('hide');
  }

  public resetFormAndModal(): void {
    this.formClient = { 
      companyName: '', 
      firstName: '', 
      lastName: '', 
      email: '', 
      phone: '', 
      address: '', 
      rfc: ''
    };

    setTimeout(() => {
      if (this.clientForm) {
        this.clientForm.resetForm(this.formClient);
        console.log('Formulario Reseteado');
      }
    });
  }

}
