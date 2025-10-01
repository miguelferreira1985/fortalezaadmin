import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../models/category';

declare var $: any;

@Component({
  selector: 'app-category-form',
  imports: [    
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css'
})
export class CategoryFormComponent implements OnInit {

  @Input() category: Category | null = null;
  @Output() saveCategory = new EventEmitter<Category>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && changes['category'].currentValue) {
      const c = changes['category'].currentValue as Category;
      this.form.patchValue({
        id: c.id,
        name: c.name,
        description: c.description
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const category: Category = this.form.value;
    this.saveCategory.emit(category);
  }

  closeCategoryForm(): void {
    $('#categoryModal').modal('hide');
  }

  resetFormAndModal(): void {
    this.form.reset({
      id: null,
      name: '',
      description: ''
    });
  }

  c(name: string) {
    return this.form.get(name)!;
  }

}
