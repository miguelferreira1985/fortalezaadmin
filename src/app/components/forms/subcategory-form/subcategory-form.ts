import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Subcategory } from '../../../models/subcategory';

declare var $: any;

@Component({
  selector: 'app-subcategory-form',
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule
  ],
  templateUrl: './subcategory-form.html',
  styleUrl: './subcategory-form.css'
})
export class SubcategoryFormComponent implements OnInit {
  @Input() subcategory: Subcategory | null = null;
  @Output() saveSubcategory = new EventEmitter<Subcategory>();

  formSubcategory: Subcategory = { name: '', description: '', categoryId: 0 };

  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subcategory'] && changes['subcategory'].currentValue) {
      // El valor del input `subcategory` ha cambiado, es el momento de cargar los datos
      this.formSubcategory = { ...changes['subcategory'].currentValue };
      console.log('Subcategory data loaded:', this.formSubcategory);
    } else if (changes['subcategory'] && !changes['subcategory'].currentValue) {
      // El valor del input `product` es null, reseteamos el formulario
      this.formSubcategory = { name: '', description: '', categoryId: 0 };
      console.log('Form reset for new subcategory.');
    }
  }

  onSubmit(): void {
    this.saveSubcategory.emit(this.formSubcategory);
  }

  closeSubcategoryForm(): void {
    $('#subcategoryModal').modal('hide');
  }

}
