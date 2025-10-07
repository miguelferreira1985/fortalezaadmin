import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../../models/client';

declare var $: any;

@Component({
  selector: 'app-client-form-component',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './client-form-component.html',
  styleUrl: './client-form-component.css'
})
export class ClientFormComponent implements OnInit {

  @Input() client: Client | null = null;
  @Output() saveClient = new EventEmitter<Client>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      phone: [''],
      rfc: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && changes['client'].currentValue) {
      const c = changes['client'].currentValue as Client;
      this.form.patchValue({
        id: c.id,
        name: c.name,
        phone: c.phone,
        rfc: c.rfc
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const client: Client = this.form.value;
    this.saveClient.emit(client);
  }

  closeClientForm(): void {
    $('#clientModal').modal('hide');
  }

  resetFormAndModal(): void {
    this.form.reset({ 
      id: null, 
      name: '', 
      phone: '', 
      rfc: ''
    });
  }
  
  c(name: string) {
    return this.form.get(name)!;
  }

}
