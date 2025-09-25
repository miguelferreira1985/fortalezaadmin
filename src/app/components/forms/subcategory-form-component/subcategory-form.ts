import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Subcategory } from '../../../models/subcategory';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { SubcategoryRequestDto } from '../../../models/subcategory-request-dto';

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
  @Output() saveSubcategory = new EventEmitter<SubcategoryRequestDto>();
  @ViewChild('subcategoryForm') subcategoryForm!: NgForm;

  formSubcategory: Subcategory = { name: '', description: '', category: { id: 0, name: '' } };
  catgories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.getCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subcategory'] && changes['subcategory'].currentValue) {
      // El valor del input `subcategory` ha cambiado, es el momento de cargar los datos
      this.formSubcategory = { ...changes['subcategory'].currentValue };
      console.log('Subcategory data loaded:', this.formSubcategory);
    } else if (changes['subcategory'] && !changes['subcategory'].currentValue) {
      // El valor del input `product` es null, reseteamos el formulario
      console.log('Form reset for new subcategory.');
    }
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.catgories = data;
    });
  }

  onSubmit(): void {
    const subcategoryToSave: SubcategoryRequestDto = {
      id: this.formSubcategory.id,
      name: this.formSubcategory.name,
      description: this.formSubcategory.description,
      categoryId: this.formSubcategory.category.id
    }
    console.log("Subcategorìa dede form:" + subcategoryToSave)
    this.saveSubcategory.emit(subcategoryToSave);
  }

  closeSubcategoryForm(): void {
    $('#subcategoryModal').modal('hide');
  }

  public resetFormAndModal(): void {
    this.formSubcategory = { name: '', description: '', category: { id: 0, name: '' } };

    setTimeout(() => {
      if (this.subcategoryForm) {
        this.subcategoryForm.resetForm(this.formSubcategory);
        console.log('Formulario Reseteado');
      }
    });
  }

}
