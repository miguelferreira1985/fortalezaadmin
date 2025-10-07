import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Subcategory } from '../../../models/subcategory';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { SubcategoryRequestDto } from '../../../models/subcategory-request-dto';
import { NgSelectModule } from '@ng-select/ng-select';

declare var $: any;

@Component({
  selector: 'app-subcategory-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BsDropdownModule,
    NgSelectModule
  ],
  templateUrl: './subcategory-form.html',
  styleUrl: './subcategory-form.css'
})
export class SubcategoryFormComponent implements OnInit {

  @Input() subcategory: Subcategory | null = null;
  @Output() saveSubcategory = new EventEmitter<SubcategoryRequestDto>();

  form!: FormGroup;
  catgories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: [''],
      categoryId: [null]
    });
    this.getCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subcategory'] && changes['subcategory'].currentValue) {
      const s = changes['subcategory'].currentValue as Subcategory;
      this.form.patchValue({
        id: s.id,
        name: s.name,
        description: s.description,
        categoryId: s.category?.id
      });
    }
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.catgories = data;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: SubcategoryRequestDto = this.form.value;
    this.saveSubcategory.emit(dto);
  }

  closeSubcategoryForm(): void {
    $('#subcategoryModal').modal('hide');
  }

  resetFormAndModal(): void {
    this.form.reset({
      id: null,
      name: '',
      description: '',
      categoryId: null
    });
  }

  c(name: string) {
    return this.form.get(name)!;
  }

}
