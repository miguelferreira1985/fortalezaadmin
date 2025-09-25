import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Category } from '../../../models/category';

declare var $: any;

@Component({
  selector: 'app-category-form',
  imports: [    
    CommonModule,
    FormsModule
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css'
})
export class CategoryFormComponent implements OnInit {

  @Input() category: Category | null = null;
  @Output() saveCategory = new EventEmitter<Category>();
  @ViewChild('categoryForm') categoryForm!: NgForm;

  formCategory: Category = { name: '', description: '' };

  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && changes['category'].currentValue) {
      // El valor del input `subcategory` ha cambiado, es el momento de cargar los datos
      this.formCategory = { ...changes['category'].currentValue };
      console.log('Category data loaded:', this.formCategory);
    } else if (changes['category'] && !changes['category'].currentValue) {
      // El valor del input `product` es null, reseteamos el formulario
      console.log('Form reset for new category.');
    }
  }

  onSubmit(): void {
    this.saveCategory.emit(this.formCategory);
  }

  closeCategoryForm(): void {
    $('#categoryModal').modal('hide');
  }

  public resetFormAndModal(): void {
    this.formCategory = { name: '', description: '' };

    setTimeout(() => {
      if (this.categoryForm) {
        this.categoryForm.resetForm(this.formCategory);
        console.log('Formulario Reseteado');
      }
    });
  }

}
